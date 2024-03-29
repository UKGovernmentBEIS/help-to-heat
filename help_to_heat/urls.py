from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from help_to_heat import views
from help_to_heat.frontdoor.urls import frontdoor_patterns
from help_to_heat.portal.urls import api_patterns, portal_patterns

if not settings.KILL_SWITCH:
    if settings.SHOW_FRONTDOOR:
        urlpatterns = [
            path("portal/", include((portal_patterns, "portal"))),
            path("", include((frontdoor_patterns, "frontdoor"))),
        ]
    else:
        urlpatterns = [
            path("", include((portal_patterns, "portal"))),
        ]

    urlpatterns = [
        path("admin/", admin.site.urls),
        path("api/", include(api_patterns)),
        path("robots.txt", views.robots_txt_view),
    ] + urlpatterns
else:
    urlpatterns = []
