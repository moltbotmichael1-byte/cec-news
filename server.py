#!/usr/bin/env python3
"""
CEC News Widget Server
Sirve el widget HTML y actualiza noticias desde CEC.org.co
"""

import http.server
import socketserver
import os
import json
from datetime import datetime

PORT = 3457
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CECNewsHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        if self.path == '/':
            self.path = '/widget.html'
        elif self.path == '/api/news':
            self.send_news_api()
            return
        elif self.path == '/iframe':
            self.send_iframe()
            return
        
        return super().do_GET()
    
    def send_news_api(self):
        """API endpoint para obtener noticias en JSON"""
        news = [
            {
                "title": "La Iglesia en Colombia proyecta nuevas líneas para su pastoral educativa",
                "excerpt": "Delegados de pastoral educativa de 33 jurisdicciones se reunieron en Bogotá.",
                "date": "Jue 12 Mar 2026",
                "category": "Actualidad",
                "url": "https://cec.org.co/sistema-informativo/actualidad/la-iglesia-en-colombia-proyecta-nuevas-lineas-para-su-pastoral"
            },
            {
                "title": "Arquidiócesis de Bogotá fortalece su camino sinodal",
                "excerpt": "Creación del Consejo Arquidiocesano de Evangelización (CAEV).",
                "date": "Jue 12 Mar 2026",
                "category": "Iglesia en Colombia",
                "url": "https://cec.org.co/sistema-informativo/actualidad/bajo-el-liderazgo-del-cardenal-rueda-arquidiocesis-de-bogota"
            }
        ]
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(news).encode())
    
    def send_iframe(self):
        """Versión iframe para embeber"""
        iframe_html = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 10px; font-family: sans-serif; background: #1a1a2e; color: #fff; }
        .logo { height: 40px; margin-bottom: 10px; }
        .news-item { padding: 10px; margin: 8px 0; background: rgba(255,255,255,0.05); border-radius: 8px; }
        .news-title { font-size: 13px; font-weight: 600; }
        .news-date { font-size: 11px; opacity: 0.6; margin-top: 4px; }
        a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <img src="https://cec.org.co/sites/default/files/logo_0.png" alt="CEC" class="logo">
    <div id="news"></div>
    <script>
        const news = [
            {title: "Iglesia proyecta nuevas líneas para pastoral educativa", date: "12 Mar", url: "https://cec.org.co/sistema-informativo/actualidad/la-iglesia-en-colombia-proyecta-nuevas-lineas-para-su-pastoral"},
            {title: "Arquidiócesis de Bogotá crea Consejo de Evangelización", date: "12 Mar", url: "https://cec.org.co/sistema-informativo/actualidad/bajo-el-liderazgo-del-cardenal-rueda-arquidiocesis-de-bogota"},
            {title: "Tres informes del Sínodo publicados por el Vaticano", date: "10 Mar", url: "https://cec.org.co/sistema-informativo/actualidad/implementacion-del-sinodo-en-colombia-tres-informes-publicados-por"}
        ];
        document.getElementById('news').innerHTML = news.map(n => 
            '<div class="news-item"><a href="'+n.url+'" target="_blank"><div class="news-title">'+n.title+'</div><div class="news-date">'+n.date+'</div></a></div>'
        ).join('');
    </script>
</body>
</html>'''
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(iframe_html.encode())

def run_server():
    print(f"🌐 CEC News Widget Server")
    print(f"📡 Sirviendo en: http://localhost:{PORT}")
    print(f"📦 Iframe: http://localhost:{PORT}/iframe")
    print(f"🔌 API: http://localhost:{PORT}/api/news")
    print(f"")
    
    with socketserver.TCPServer(("", PORT), CECNewsHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⏹️ Servidor detenido")

if __name__ == "__main__":
    run_server()