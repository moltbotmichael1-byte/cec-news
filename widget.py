#!/usr/bin/env python3
"""
CEC News Widget - Extrae noticias de CEC.org.co
Conferencia Episcopal de Colombia
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json

BASE_URL = "https://cec.org.co"

def get_news(limit=10):
    """Extrae noticias de la página principal de CEC.org.co"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(BASE_URL, headers=headers, timeout=30)
        response.raise_for_status()
    except Exception as e:
        return {"error": f"Error fetching CEC news: {e}"}
    
    soup = BeautifulSoup(response.text, 'html.parser')
    news = []
    
    # Buscar artículos de noticias
    articles = soup.find_all('article') or soup.find_all('div', class_='news-item')
    
    # Si no encuentra con selectores estándar, buscar enlaces de noticias
    if not articles:
        # Buscar en la sección "Actualidad"
        links = soup.find_all('a', href=lambda x: x and '/sistema-informativo/' in x)
        seen_titles = set()
        
        for link in links[:limit * 2]:  # Duplicar para filtrar duplicados
            title_elem = link.find(['h5', 'h4', 'h3', 'h2'])
            if title_elem:
                title = title_elem.get_text(strip=True)
            else:
                title = link.get_text(strip=True)
            
            if title and title not in seen_titles and len(title) > 20:
                seen_titles.add(title)
                href = link.get('href', '')
                if not href.startswith('http'):
                    href = BASE_URL + href
                
                # Buscar fecha
                date_elem = link.find_previous(string=lambda x: x and any(
                    month in x for month in ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                                               'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                ))
                date = date_elem.strip() if date_elem else ""
                
                news.append({
                    "title": title,
                    "url": href,
                    "date": date,
                    "source": "CEC.org.co"
                })
                
                if len(news) >= limit:
                    break
    
    return news

def get_category_news(category="actualidad", limit=5):
    """Extrae noticias de una categoría específica"""
    
    category_urls = {
        "actualidad": "/categorias-articulos/actualidad",
        "iglesia-colombia": "/categorias-articulos/la-iglesia-en-colombia",
        "episcopado": "/categorias-articulos/episcopado-al-dia",
        "opinion": "/categorias-artículos/opinión",
        "evangelio": "/categorias-articulos/evangelio-diario"
    }
    
    url = BASE_URL + category_urls.get(category, "/")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except Exception as e:
        return {"error": f"Error fetching category {category}: {e}"}
    
    soup = BeautifulSoup(response.text, 'html.parser')
    news = []
    
    links = soup.find_all('a', href=lambda x: x and '/sistema-informativo/' in x)
    seen_titles = set()
    
    for link in links[:limit * 2]:
        title_elem = link.find(['h5', 'h4', 'h3'])
        if title_elem:
            title = title_elem.get_text(strip=True)
        else:
            continue
            
        if title and title not in seen_titles and len(title) > 20:
            seen_titles.add(title)
            href = link.get('href', '')
            if not href.startswith('http'):
                href = BASE_URL + href
            
            news.append({
                "title": title,
                "url": href,
                "category": category,
                "source": "CEC.org.co"
            })
            
            if len(news) >= limit:
                break
    
    return news

def format_news_for_widget(news_list, max_length=200):
    """Formatea noticias para mostrar en widget"""
    
    if isinstance(news_list, dict) and "error" in news_list:
        return f"❌ {news_list['error']}"
    
    output = []
    for i, item in enumerate(news_list, 1):
        title = item.get("title", "")[:max_length]
        if len(item.get("title", "")) > max_length:
            title += "..."
        date = item.get("date", "")
        url = item.get("url", "")
        
        output.append(f"{i}. **{title}**")
        if date:
            output.append(f"   📅 {date}")
        output.append(f"   🔗 {url}")
        output.append("")
    
    return "\n".join(output)

if __name__ == "__main__":
    print("=== Noticias CEC.org.co ===\n")
    news = get_news(limit=5)
    
    if isinstance(news, dict) and "error" in news:
        print(news["error"])
    else:
        for i, item in enumerate(news, 1):
            print(f"{i}. {item['title'][:80]}...")
            print(f"   {item['url']}")
            print()