from django.contrib import admin
from django.urls import path, re_path
from web.views import ReactAppView, LoginView, RegisterView, LogoutView, UserView, GetCSRFToken, RequestBloodView, GetRequestsView, AllocateDonorView, LogDonationView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login', LoginView.as_view()),
    path('api/register', RegisterView.as_view()),
    path('api/logout', LogoutView.as_view()),
    path('api/user', UserView.as_view()),
    path('api/csrf', GetCSRFToken.as_view()),
    path('api/request-blood', RequestBloodView.as_view()),
    path('api/all-requests', GetRequestsView.as_view()),
    path('api/allocate-donor', AllocateDonorView.as_view()),
    path('api/donate', LogDonationView.as_view()),
    re_path(r'^.*$', ReactAppView.as_view()),
]
