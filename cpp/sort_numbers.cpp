/**
 * 数字排序程序
 * 功能: 读取文件中的数字，进行排序，输出到文件
 *
 * 编译: g++ -o sort_numbers sort_numbers.cpp
 * 用法: sort_numbers <输入文件> <输出文件> <asc|desc>
 */

#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <string>
#include <sstream>
#include <cstdlib>

// 排序方向
enum class SortOrder { ASC, DESC };

// 从字符串中提取数字
bool extractNumber(const std::string& str, double& num) {
    std::stringstream ss(str);
    ss >> num;
    return !ss.fail() && !ss.eof();
}

// 从文件读取所有数字
std::vector<double> readNumbers(const std::string& filename) {
    std::vector<double> numbers;
    std::ifstream file(filename);

    if (!file.is_open()) {
        std::cerr << "Error: Cannot open input file: " << filename << std::endl;
        return numbers;
    }

    std::string line;
    while (std::getline(file, line)) {
        // 跳过空行
        if (line.empty()) continue;

        // 尝试解析为数字
        double num;
        if (extractNumber(line, num)) {
            numbers.push_back(num);
        }
    }

    file.close();
    return numbers;
}

// 写入排序后的数字到文件
bool writeNumbers(const std::string& filename, const std::vector<double>& numbers) {
    std::ofstream file(filename);

    if (!file.is_open()) {
        std::cerr << "Error: Cannot open output file: " << filename << std::endl;
        return false;
    }

    for (size_t i = 0; i < numbers.size(); ++i) {
        // 格式: 如果是整数则不带小数点，否则保留合理精度
        if (numbers[i] == static_cast<long long>(numbers[i])) {
            file << static_cast<long long>(numbers[i]);
        } else {
            file << numbers[i];
        }
        if (i < numbers.size() - 1) {
            file << "\n";
        }
    }

    file.close();
    return true;
}

// 自定义比较函数
bool compareAsc(double a, double b) {
    return a < b;
}

bool compareDesc(double a, double b) {
    return a > b;
}

int main(int argc, char* argv[]) {
    // 参数检查
    if (argc != 4) {
        std::cerr << "Usage: " << argv[0] << " <input_file> <output_file> <asc|desc>" << std::endl;
        return 1;
    }

    std::string inputFile = argv[1];
    std::string outputFile = argv[2];
    std::string orderStr = argv[3];

    // 解析排序方向
    SortOrder order;
    if (orderStr == "desc") {
        order = SortOrder::DESC;
    } else {
        order = SortOrder::ASC;  // 默认为升序
    }

    // 读取数字
    std::vector<double> numbers = readNumbers(inputFile);

    if (numbers.empty()) {
        std::cerr << "Error: No numbers found in input file" << std::endl;
        return 1;
    }

    // 排序
    if (order == SortOrder::ASC) {
        std::sort(numbers.begin(), numbers.end(), compareAsc);
    } else {
        std::sort(numbers.begin(), numbers.end(), compareDesc);
    }

    // 写入结果
    if (!writeNumbers(outputFile, numbers)) {
        return 1;
    }

    std::cout << "Sorted " << numbers.size() << " numbers ("
              << (order == SortOrder::ASC ? "ascending" : "descending") << ")" << std::endl;

    return 0;
}
