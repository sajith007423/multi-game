import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from .models import GameScore
from django.db.models import Max, Min

@ensure_csrf_cookie
def index(request):
    return render(request, 'trainer/index.html')

def save_score(request):
    if request.method == 'POST':
        # Auto-login as Guest if needed (or just assign to Guest user)
        user = request.user
        if not user.is_authenticated:
            # Try to find or create a guest user
            from django.contrib.auth.models import User
            user, created = User.objects.get_or_create(username='Guest')
            if created:
                user.set_unusable_password()
                user.save()
        
        try:
            data = json.loads(request.body)
            mode = data.get('game_mode')
            score = float(data.get('score', 0))
            meta = data.get('metadata', {})
            
            GameScore.objects.create(
                user=user,
                game_mode=mode,
                score=score,
                metadata=meta
            )
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error'}, status=405)

def get_leaderboard(request):
    mode = request.GET.get('game_mode')
    if not mode:
        return JsonResponse({'error': 'Missing game_mode'}, status=400)
        
    # Determine sorting: Time based games (lower is better) vs Score based
    TIME_GAMES = ['schulte_standard', 'schulte_mem', 'visual_search']
    order = 'score' if mode in TIME_GAMES else '-score'
    
    # Get top 10 scores
    scores = GameScore.objects.filter(game_mode=mode).select_related('user').order_by(order)[:10]
    
    data = [{
        'user': s.user.username,
        'score': s.score,
        'date': s.created_at.strftime('%Y-%m-%d')
    } for s in scores]
    return JsonResponse({'leaderboard': data})

@login_required
def my_progress(request):
    # Aggregate stats for charts
    scores = GameScore.objects.filter(user=request.user).order_by('created_at')
    
    # Group by mode
    history = {}
    for s in scores:
        if s.game_mode not in history: history[s.game_mode] = []
        history[s.game_mode].append({
            'score': s.score,
            'date': s.created_at.strftime('%Y-%m-%d %H:%M')
        })
        
    return JsonResponse({'history': history})
