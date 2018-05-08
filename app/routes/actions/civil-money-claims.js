var userEngine = require('../../models/users');
var caseEngine = require('../../models/cases');
var helpers = require('../helpers');

function viewCaseSummary(req, res) {

	var c = caseEngine.getCase(req.params.id);

	var pageObject = {
		casebar: helpers.getCaseBarObject(c.id),
		casenav: helpers.getCaseNavObject(c.id),
		detailsRows: [],
		representativesRows: []
	};

	// Case details
	pageObject.detailsRows.push([{ html: 'Parties' }, {html: helpers.getPartiesLine(c.id)}]);
	pageObject.detailsRows.push([{ html: 'Case number' },	{ html: c.id + (c.urgent ? ' <span class="jui-status  jui-status--urgent  govuk-!-ml-r1">Urgent</span> ' : '') }]);
	pageObject.detailsRows.push([{ html: 'Case type' },	{ html: c.type }]);
	pageObject.detailsRows.push([{ html: 'Case status' },	{ html: c.status }]);
	pageObject.detailsRows.push([{ html: 'Court' },	{ html: c.court }]);

	// Panel
	pageObject.representativesRows.push([{ html: 'Claimant' }, { html: c.claimant ? c.claimant : '(Unrepresented)' }]);
	pageObject.representativesRows.push([{ html: 'Defendant' }, { html: c.defendant ? c.defendant : '(Unrepresented)' }]);

	res.render('v1/case/civil-money-claims/summary', pageObject);

}

exports.viewCaseSummary = viewCaseSummary;