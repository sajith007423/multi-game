from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/save_score/', views.save_score, name='save_score'),
    path('api/leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    path('api/my_progress/', views.my_progress, name='my_progress'),
]
