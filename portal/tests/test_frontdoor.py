import unittest
import uuid

from django.conf import settings
from help_to_heat.frontdoor import interface
from help_to_heat.portal import models

from . import utils


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_flow_northern_ireland():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    form = page.get_form()
    form["country"] = "Northern Ireland"
    page = form.submit().follow()

    assert page.has_text("The scheme does not apply to homes in Northern Ireland")

    data = interface.api.session.get_answer(session_id, page_name="country")
    assert data["country"] == "Northern Ireland"

    page = page.click(contains="Back")
    assert page.has_one("h1:contains('Which country is your property located in?')")


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_flow_scotland():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    form = page.get_form()
    form["country"] = "Scotland"
    page = form.submit().follow()

    assert page.has_text("As your property is in Scotland, you must use a different service")

    data = interface.api.session.get_answer(session_id, page_name="country")
    assert data["country"] == "Scotland"

    page = page.click(contains="Back")
    assert page.has_one("h1:contains('Which country is your property located in?')")


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_flow_errors():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    form = page.get_form()
    page = form.submit()

    assert page.has_one("h2:contains('There is a problem')")
    assert page.has_text("Please answer this question")


def _answer_house_questions(page, session_id, benefits_answer):
    """Answer main flow with set answers"""

    _check_page = _make_check_page(session_id)

    form = page.get_form()
    form["country"] = "England"
    page = form.submit().follow()

    assert page.has_text("Do you own your property?")
    page = _check_page(page, "own-property", "own_property", "Yes, I own my property and live in it")

    assert page.has_one("h1:contains('What is the address of your property?')")

    form = page.get_form()
    form["address_line_1"] = "999 Letsby Avenue"
    form["postcode"] = "PO99 9PO"
    page = form.submit().follow()

    data = interface.api.session.get_answer(session_id, page_name="address")
    assert data["address_line_1"] == "999 Letsby Avenue"
    assert data["postcode"] == "PO99 9PO"

    assert page.has_one("h1:contains('What is the council tax band of your property?')")
    page = _check_page(page, "council-tax-band", "council_tax_band", "B")

    assert page.has_one("h1:contains('Is anyone in your household receiving any benefits?')")
    page = _check_page(page, "benefits", "benefits", benefits_answer)

    assert page.has_one("h1:contains('What is your annual household income?')")
    page = _check_page(page, "household-income", "household_income", "Less than £31,000 a year")

    assert page.has_one("h1:contains('What kind of property do you have?')")
    page = _check_page(page, "property-type", "property_type", "House")

    assert page.has_one("h1:contains('How many bedrooms does the property have?')")
    page = _check_page(page, "number-of-bedrooms", "number_of_bedrooms", "Two bedrooms")

    assert page.has_one("h1:contains('What kind of walls does your property have?')")
    page = _check_page(page, "wall-type", "wall_type", "Cavity walls")

    assert page.has_one("h1:contains('Are your walls insulated?')")
    page = _check_page(page, "wall-insulation", "wall_insulation", "No they are not insulated")

    assert page.has_one("h1:contains('Does this property have a loft?')")
    page = _check_page(page, "loft", "loft", "No")

    assert page.has_one("h1:contains('Is there access to your loft?')")
    page = _check_page(page, "loft-access", "loft_access", "Yes, there is access to my loft")

    assert page.has_one("h1:contains('Check your answers')")
    form = page.get_form()
    page = form.submit().follow()

    return page


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_happy_flow():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    _check_page = _make_check_page(session_id)

    # Answer main flow
    page = _answer_house_questions(page, session_id, benefits_answer="Yes")

    assert page.has_one("h1:contains('Information based on your answers')")
    assert page.has_text("Great British Insulation scheme")
    assert page.has_text("Energy Company Obligation 4")
    form = page.get_form()
    page = form.submit().follow()

    assert page.has_one("h1:contains('Select your home energy supplier from the list below.')")
    page = _check_page(page, "supplier", "supplier", "Octopus")

    assert page.has_one("h1:contains('Add your personal and contact details')")
    form = page.get_form()

    page = form.submit()
    assert page.has_text("Please answer this question")
    assert page.has_one("p#question-first_name-error.govuk-error-message:contains('Please answer this question')")

    form["first_name"] = "Freddy"
    form["last_name"] = "Flibble"
    form["contact_number"] = "1234567890"
    form["email"] = "freddy.flibble@example.com"
    page = form.submit().follow()

    assert page.has_one("h1:contains('Confirm and submit')")

    page = page.click(contains="Change Energy supplier")

    form = page.get_form()
    form["supplier"] = "British Gas"
    page = form.submit().follow()

    assert page.has_one("h1:contains('Confirm and submit')")
    assert page.has_text("British Gas")

    form = page.get_form()
    page = form.submit()

    assert page.has_text("Please answer this question")
    form = page.get_form()
    form["permission"] = True

    page = form.submit().follow()

    assert page.has_one("h1:contains('Your details have been submitted to British Gas')")

    data = interface.api.session.get_answer(session_id, page_name="contact-details")
    expected = {
        "first_name": "Freddy",
        "last_name": "Flibble",
        "contact_number": "1234567890",
        "email": "freddy.flibble@example.com",
    }
    assert data == expected, (data, expected)

    referral = models.Referral.objects.get(session_id=session_id)
    assert referral.supplier.name == "British Gas"
    assert referral.data["first_name"] == "Freddy"
    assert referral.data["benefits"] == "Yes"
    referral.delete()


def _make_check_page(session_id):
    def _check_page(page, page_name, key, answer):
        form = page.get_form()
        form[key] = answer
        page = form.submit().follow()

        data = interface.api.session.get_answer(session_id, page_name=page_name)
        assert data[key] == answer
        return page

    return _check_page


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_back_button():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    assert page.has_one("h1:contains('Which country is your property located in?')")
    assert not page.has_one("a:contains('Back')")

    form = page.get_form()
    form["country"] = "England"
    page = form.submit().follow()

    assert page.has_text("Do you own your property?")

    form = page.get_form()
    form["own_property"] = "Yes, I own my property and live in it"
    page = form.submit().follow()

    assert page.has_one("h1:contains('What is the address of your property?')")

    page = page.click(contains="Back")

    form = page.get_form()
    assert form["own_property"] == "Yes, I own my property and live in it"

    page = page.click(contains="Back")

    form = page.get_form()
    assert form["country"] == "England"


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_no_benefits_flow():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    # Answer main flow
    page = _answer_house_questions(page, session_id, benefits_answer="No")

    assert page.has_one("h1:contains('Information based on your answers')")
    assert page.has_text("Great British Insulation scheme")
    assert not page.has_text("Energy Company Obligation 4")
    form = page.get_form()
    page = form.submit().follow()


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_summary():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    # Answer main flow
    page = _answer_house_questions(page, session_id, benefits_answer="Yes")

    page = page.click(contains="Back")

    page = page.click(contains="Change Do you own your property?")

    form = page.get_form()
    form["own_property"] = "I am a property owner but lease my property to one or more tenants"
    page = form.submit().follow()

    assert page.has_one("h1:contains('Check your answers')")

    assert page.has_text("I am a property owner but lease my property to one or more tenants")
