from django.db import models
from django.contrib.auth.models import User

class GameScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    game_mode = models.CharField(max_length=50) # e.g. 'schulte_standard', 'memory', 'matrix'
    score = models.FloatField() # Could be time (seconds) or points
    metadata = models.JSONField(default=dict, blank=True) # Extra data like 'level', 'difficulty', 'grid_size'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.game_mode}: {self.score}"

    class Meta:
        ordering = ['-score'] # Default ordering, but for time-based games lower is better. We'll handle this in views.
