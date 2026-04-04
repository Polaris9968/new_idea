import os
from http.server import HTTPServer, CGIHTTPRequestHandler

class MyCGIHandler(CGIHTTPRequestHandler):
    # 强制指定 CGI 目录，防止某些系统环境识别失败
    cgi_directories = ["/cgi-bin"]

def run():
    # 使用 0.0.0.0 可以让同局域网的其他设备也能访问
    server_address = ('', 8080)
    # 关键修复点：手动给 server 对象加上 server_name 属性，绕过 Python 的 Bug
    httpd = HTTPServer(server_address, MyCGIHandler)
    httpd.server_name = "localhost"
    httpd.server_port = 8080
    
    print("🚀 服务器已启动！请访问: http://localhost:8080")
    print("📂 正在监听文件上传并调用 C++ 排序...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()