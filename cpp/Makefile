# C++ 排序程序 Makefile

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2
TARGET = sort_numbers
SRC = sort_numbers.cpp

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET)

# Windows MSVC 兼容版本
msvc: cl /EHsc /O2 /Fe:sort_numbers.exe sort_numbers.cpp
