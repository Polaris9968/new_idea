#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数字排序 - 文件上传处理 CGI 脚本
接收上传文件，提取数字，调用 C++ 程序排序，返回结果
"""

import cgi
import os
import sys
import json
import tempfile
import subprocess

# 添加当前目录到路径，以便导入 parse_utils
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_utils import ParseUtils

# 配置
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
CPP_PROGRAM = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cpp', 'sort_numbers.exe')
ALLOWED_EXTENSIONS = {'.txt', '.csv', '.xlsx', '.xls', '.doc', '.docx'}


def main():
    print("Content-Type: application/json")
    print()

    try:
        form = cgi.FieldStorage()

        # 获取排序顺序
        order = form.getvalue('order', 'asc')
        if order not in ['asc', 'desc']:
            order = 'asc'

        # 获取上传文件
        file_item = form['file']
        if not file_item.filename:
            print(json.dumps({"error": "没有上传文件"}, ensure_ascii=False))
            return

        filename = file_item.filename
        ext = '.' + filename.split('.')[-1].lower() if '.' in filename else ''

        if ext not in ALLOWED_EXTENSIONS:
            print(json.dumps({"error": f"不支持的文件格式: {ext}"}, ensure_ascii=False))
            return

        # 保存上传文件到临时目录
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # 使用安全的方式创建临时文件
        with tempfile.NamedTemporaryFile(mode='wb', delete=False,
                                          suffix=ext, dir=UPLOAD_DIR) as f:
            temp_path = f.name
            # file_item 是 FieldStorage 的文件对象，用 .file.read() 读取内容
            content = file_item.file.read()
            f.write(content)

        try:
            # 解析文件提取数字
            parser = ParseUtils(temp_path, ext)
            numbers = parser.extract_numbers()

            if not numbers:
                print(json.dumps({"error": "文件中未找到数字"}, ensure_ascii=False))
                return

            # 调用 C++ 程序排序
            sorted_numbers = run_cpp_sort(numbers, order)

            # 返回结果
            result = {
                "numbers": numbers,
                "sorted_numbers": sorted_numbers,
                "original_format": ext
            }
            print(json.dumps(result, ensure_ascii=False))

        finally:
            # 清理临时文件
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))


def run_cpp_sort(numbers, order):
    """调用 C++ 程序进行排序"""
    # 确保 C++ 程序存在
    if not os.path.exists(CPP_PROGRAM):
        # 尝试不使用 .exe 后缀
        cpp_exe = os.path.join(os.path.dirname(CPP_PROGRAM), 'sort_numbers')
        if os.path.exists(cpp_exe):
            cpp_prog = cpp_exe
        else:
            # 如果 C++ 程序不存在，使用 Python 内置排序作为后备
            print(f"C++ program not found, using Python fallback", file=sys.stderr)
            return sorted(numbers, reverse=(order == 'desc'))
    else:
        cpp_prog = CPP_PROGRAM

    try:
        # 将数字写入临时输入文件
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            input_path = f.name
            f.write('\n'.join(str(n) for n in numbers))

        # 创建输出文件
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            output_path = f.name

        try:
            # 调用 C++ 程序
            # 命令格式: sort_numbers <input_file> <output_file> <asc|desc>
            cmd = [cpp_prog, input_path, output_path, order]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode != 0:
                # 如果 C++ 程序失败，使用 Python 内置排序作为后备
                print(f"C++ sort failed: {result.stderr}", file=sys.stderr)
                sorted_numbers = sorted(numbers, reverse=(order == 'desc'))
            else:
                # 读取排序结果
                with open(output_path, 'r') as f:
                    sorted_numbers = [float(line.strip()) for line in f if line.strip()]
                    # 如果原数字是整数，保持格式
                    sorted_numbers = [
                        int(n) if n == int(n) else n
                        for n in sorted_numbers
                    ]

        finally:
            # 清理临时文件
            for p in [input_path, output_path]:
                if os.path.exists(p):
                    os.unlink(p)

        return sorted_numbers

    except subprocess.TimeoutExpired:
        raise Exception("排序超时，请重试")
    except FileNotFoundError:
        # C++ 程序不存在，使用 Python 排序
        print("C++ program not found, using Python fallback", file=sys.stderr)
        return sorted(numbers, reverse=(order == 'desc'))
    except Exception as e:
        raise Exception(f"排序失败: {str(e)}")


if __name__ == '__main__':
    main()
