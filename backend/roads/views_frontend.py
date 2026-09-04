from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def roads_info(request):
    return render(request, 'roads-info.html')