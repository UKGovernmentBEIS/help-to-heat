from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import TemplateView
from help_to_heat.frontdoor.urls import frontdoor_patterns
from help_to_heat.portal.urls import api_patterns, portal_patterns

if settings.SHOW_FRONTDOOR:
    urlpatterns = [
        path("portal/", include((portal_patterns, "portal"))),
        path("", include((frontdoor_patterns, "frontdoor"))),
        path("robots.txt", TemplateView.as_view(template_name="frontdoor/robots.txt", content_type="text/plain")),
    ]
else:
    urlpatterns = [
        path("", include((portal_patterns, "portal"))),
    ]


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_patterns)),
] + urlpatterns
