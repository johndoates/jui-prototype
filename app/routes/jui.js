var express = require('express');
var router = express.Router();
var types = require('../data/types');
var helpers = require('./helpers');

router.use(function(req, res, next) {
	if(!req.session.cases) {
		req.session.cases = require('../data/cases');
	}
	next();
});

router.get('/sign-out', (req, res) => {
	req.session.destroy();
	res.redirect('/app/signin');
});

router.get('/app/signin', (req, res) => {
	res.render('signin');
});

router.post('/app/signin', (req, res) => {
	res.redirect('/app/dashboard');
});

router.get('/setup', (req, res) => {
	req.session.destroy();
	var pageObject = {};
	pageObject.types = Object.keys(types).map(key => ({
		value: types[key].id,
		text: types[key].label,
		checked: types[key].id === 'pip'
	}));
	res.render('setup', pageObject);
});

router.post('/setup', (req, res) => {
	// store service lines
	req.session.types = req.body.types;
	req.flash('success', 'prototype setup');
	res.redirect('/app/dashboard');
});

router.get('/app', (req, res) => {
	res.redirect('/app/dashboard');
});

router.get('/app/cases', (req, res) => {
	res.redirect('/app/dashboard');
});

router.get('/app/dashboard', (req, res) => {
	var caseList = req.session.cases;

	// Only filter by type if there are some.
	if(req.session.types) {
		caseList = caseList.filter(c => req.session.types.indexOf(c.typeId) > -1);
	}

	caseList = caseList.map(function(c) {
		var cells = [];

		cells.push({
			html : '<a href="/app/cases/' + c.id + '">'+ c.id + '</a>' + (c.urgent ? ' <span class="jui-status  jui-status--urgent  govuk-!-margin-left-1">Urgent</span> ' : '')
		});

		cells.push({ html: helpers.getPartiesLine(c)	});
		cells.push({ html: helpers.getCaseTypeLabel(c) });
		cells.push({ html: c.status });
		cells.push({ html: helpers.getFormattedShortDate(c.applicationDate) });
		cells.push({ html: helpers.getFormattedShortDate(c.lastAction) });

		return cells;

	});

	var successFlash = req.flash('success')[0];

	if(successFlash == 'cases added') {

		var newCases = req.session.cases
			.map(function(c) {

			var cells = [];

			cells.push({
				html : '<a href="/app/cases/' + c.id + '">'+ c.id +'</a>' + ' <span class="jui-status  jui-status--new  govuk-!-margin-left-1">New</span>'
			});

			cells.push({ html: helpers.getPartiesLine(c)
			});

			cells.push({ html: c.type });
			cells.push({ html: c.status });
			cells.push({ html: c.applicationDate });
			cells.push({ html: c.documents });
			cells.push({ html: c.lastAction });

			return cells;

		});

		Array.prototype.injectArray = function( idx, arr ) {
			return this.slice( 0, idx ).concat( arr ).concat( this.slice( idx ) );
		};

		caseList = caseList.injectArray(1, newCases);

	}

	var pageObject = {
		caseList: caseList
	};

	switch(successFlash) {
		case 'prototype setup':
			pageObject.success = 'Prototype setup';
			break;
		case 'cases added':
			pageObject.success = 'Cases added';
			break;
	}

	res.render('app/dashboard', pageObject);

});

router.post('/app/get-new-case', (req, res) => {
	req.flash('success', 'cases added');
	res.redirect('/app/dashboard');
});

router.get('/app/cases/:id', (req, res) => {
	var _case = req.session.cases.filter(c => c.id == req.params.id)[0];
	res.redirect(`/app/cases/${_case.id}/` + helpers.getCaseType(_case).toLowerCase());
});

router.get('/app/cases/:id/documents', (req, res) => {
	var _case = helpers.getCase(req.session.cases, req.params.id);
	res.redirect(`/app/cases/${req.params.id}/documents/${_case.documents[0].id}`);
});

router.get('/app/cases/:case_id/documents/:document_id', (req, res) => {

	var _case = helpers.getCase(req.session.cases, req.params.case_id);

	var pageObject = {
		documents: _case.documents,
		casebar: helpers.getCaseBarObject(_case),
		caseNavItems: helpers.getCaseNavItems(_case, 'casefile'),
		caseActions: helpers.getCaseActions(_case),
		activeDocument: req.params.document_id,
		_case: _case
	};

	var templatePath = `app/case/${helpers.getCaseType(_case).toLowerCase()}/documents/${req.params.document_id}`;

	res.render(templatePath, pageObject);

});

router.get('/app/cases/:id/timeline', (req, res) => {

	var _case = helpers.getCase(req.session.cases, req.params.id);

	var pageObject = {
		casebar: helpers.getCaseBarObject(_case),
		caseNavItems: helpers.getCaseNavItems(_case, 'timeline'),
		caseActions: helpers.getCaseActions(_case),
		events: helpers.getEvents(_case)
	};

	res.render('app/case/timeline', pageObject);

});

module.exports = router;