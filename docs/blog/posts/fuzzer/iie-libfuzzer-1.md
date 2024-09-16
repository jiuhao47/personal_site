---
draft: true
date: 2024-09-16
authors:
  - Jiuhao 
categories: 
  - Fuzz
  - Tool Tutorial
tags:
  - Fuzz
  - IIE
  - Libfuzzer
---

# Libfuzzer 源码阅读（一）

<!-- more -->

## FuzzerBuiltins.h

定义了一些包装函数和宏

```c++
#include "FuzzerPlatform.h"
#include <cstdint>
```

- `cstdint` 是 C++11 引入的头文件，定义了一些标准的整数类型，如 `int8_t`、`int16_t`、`int32_t`、`int64_t`、`uint8_t`、`uint16_t`、`uint32_t`、`uint64_t` 等。

- [FuzzerPlatform.h](#fuzzerplatformh)：定义了一些平台相关的宏和函数。

### 部分函数及命名空间定义

> `C++`语言的命名空间是一种用于组织代码的机制，主要用于避免名称冲突。命名空间允许将标识符（如变量、函数、类等）分组，从而在不同的命名空间中可以使用相同的名称而不会产生冲突。

```cpp
namespace fuzzer {

inline uint8_t  Bswap(uint8_t x)  { return x; }
inline uint16_t Bswap(uint16_t x) { return __builtin_bswap16(x); }
inline uint32_t Bswap(uint32_t x) { return __builtin_bswap32(x); }
inline uint64_t Bswap(uint64_t x) { return __builtin_bswap64(x); }

inline uint32_t Clzll(unsigned long long X) { return __builtin_clzll(X); }
inline int Popcountll(unsigned long long X) { return __builtin_popcountll(X); }

}
```

- `Bswap`系列函数：用于字节序转换，分别处理8位、16位、32位和64位整数。
- `Clzll`：计算无符号长整型的前导零数量。
- `Popcountll`：计算无符号长整型的位数中1的数量。



## FuzzerPlatform.h

主要用于定义与平台相关的宏，以便在不同操作系统上进行模糊测试

```cpp
#if defined(__has_feature)
#if __has_feature(address_sanitizer)
#define ATTRIBUTE_NO_SANITIZE_ALL ATTRIBUTE_NO_SANITIZE_ADDRESS
#elif __has_feature(memory_sanitizer)
#define ATTRIBUTE_NO_SANITIZE_ALL ATTRIBUTE_NO_SANITIZE_MEMORY
#else
#define ATTRIBUTE_NO_SANITIZE_ALL
#endif
#else
#define ATTRIBUTE_NO_SANITIZE_ALL
#endif
```

- `__has_feature`：用于检查编译器是否支持某个特性。
- `address_sanitizer`：地址检测器。
- `memory_sanitizer`：内存检测器。
- `ATTRIBUTE_NO_SANITIZE_ALL`：用于指示编译器不要对函数进行某种类型的检测。

### 内存/地址检测器

- [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html)：地址检测器，用于检测内存访问错误。

## FuzzerBuiltinsMsvc.h

主要用于在MSVC编译器下提供一些内置函数的替代实现


```cpp
#include "FuzzerPlatform.h"
```

- [FuzzerPlatform.h](#fuzzerplatformh)：定义了一些平台相关的宏和函数。


```cpp
// __builtin_return_address() cannot be compiled with MSVC. Use the equivalent
// from <intrin.h>
#define GET_CALLER_PC() _ReturnAddress()
```

定义了`GET_CALLER_PC()`宏，使用`_ReturnAddress()`替代`__builtin_return_address()`，因为后者在MSVC中不可用。

```cpp
namespace fuzzer {

inline uint8_t  Bswap(uint8_t x)  { return x; }
// Use alternatives to __builtin functions from <stdlib.h> and <intrin.h> on
// Windows since the builtins are not supported by MSVC.
inline uint16_t Bswap(uint16_t x) { return _byteswap_ushort(x); }
inline uint32_t Bswap(uint32_t x) { return _byteswap_ulong(x); }
inline uint64_t Bswap(uint64_t x) { return _byteswap_uint64(x); }

// The functions below were mostly copied from
// compiler-rt/lib/builtins/int_lib.h which defines the __builtin functions used
// outside of Windows.
inline uint32_t Clzll(uint64_t X) {
  unsigned long LeadZeroIdx = 0;

#if !defined(_M_ARM) && !defined(_M_X64)
  // Scan the high 32 bits.
  if (_BitScanReverse(&LeadZeroIdx, static_cast<unsigned long>(X >> 32)))
    return static_cast<int>(
        63 - (LeadZeroIdx + 32)); // Create a bit offset from the MSB.
  // Scan the low 32 bits.
  if (_BitScanReverse(&LeadZeroIdx, static_cast<unsigned long>(X)))
    return static_cast<int>(63 - LeadZeroIdx);

#else
  if (_BitScanReverse64(&LeadZeroIdx, X)) return 63 - LeadZeroIdx;
#endif
  return 64;
}

inline int Popcountll(unsigned long long X) {
#if !defined(_M_ARM) && !defined(_M_X64)
  return __popcnt(X) + __popcnt(X >> 32);
#else
  return __popcnt64(X);
#endif
}
}  // namespace fuzzer
```

- `Bswap`系列函数：用于字节序转换，分别处理8位、16位、32位和64位整数。
- `Clzll`：计算无符号长整型的前导零数量。
- `Popcountll`：计算无符号长整型的位数中1的数量。

## FuzzerCommand.h

```cpp
#include "FuzzerDefs.h"
#include "FuzzerIO.h"

#include <sstream>
#include <algorithm>
#include <string>
#include <vector>
#include <thread>
```

- [FuzzerDefs.h](#fuzzerdefsh)：定义了一些常量和数据结构。
- [FuzzerIO.h](#fuzzerioh)：定义了一些输入输出相关的函数。
- `sstream`：定义了一些用于字符串流的类。
- `algorithm`：定义了一些用于操作序列的函数。
- `string`：定义了一些用于字符串操作的函数。
- `vector`：定义了一些用于向量操作的函数。
- `thread`：定义了一些用于线程操作的函数。

```cpp
namespace fuzzer {

class Command final {
public:
  // This command line flag is used to indicate that the remaining command line
  // is immutable, meaning this flag effectively marks the end of the mutable
  // argument list.
  static inline const char *ignoreRemainingArgs() {
    return "-ignore_remaining_args=1";
  }

  Command() : CombinedOutAndErr(false) {}

  explicit Command(const std::vector<std::string> &ArgsToAdd)
      : Args(ArgsToAdd), CombinedOutAndErr(false) {}

  explicit Command(const Command &Other)
      : Args(Other.Args), CombinedOutAndErr(Other.CombinedOutAndErr),
        OutputFile(Other.OutputFile) {}

  Command &operator=(const Command &Other) {
    Args = Other.Args;
    CombinedOutAndErr = Other.CombinedOutAndErr;
    OutputFile = Other.OutputFile;
    return *this;
  }

  ~Command() {}

  // Returns true if the given Arg is present in Args.  Only checks up to
  // "-ignore_remaining_args=1".
  bool hasArgument(const std::string &Arg) const {
    auto i = endMutableArgs();
    return std::find(Args.begin(), i, Arg) != i;
  }

  // Gets all of the current command line arguments, **including** those after
  // "-ignore-remaining-args=1".
  const std::vector<std::string> &getArguments() const { return Args; }

  // Adds the given argument before "-ignore_remaining_args=1", or at the end
  // if that flag isn't present.
  void addArgument(const std::string &Arg) {
    Args.insert(endMutableArgs(), Arg);
  }

  // Adds all given arguments before "-ignore_remaining_args=1", or at the end
  // if that flag isn't present.
  void addArguments(const std::vector<std::string> &ArgsToAdd) {
    Args.insert(endMutableArgs(), ArgsToAdd.begin(), ArgsToAdd.end());
  }

  // Removes the given argument from the command argument list.  Ignores any
  // occurrences after "-ignore_remaining_args=1", if present.
  void removeArgument(const std::string &Arg) {
    auto i = endMutableArgs();
    Args.erase(std::remove(Args.begin(), i, Arg), i);
  }

  // Like hasArgument, but checks for "-[Flag]=...".
  bool hasFlag(const std::string &Flag) const {
    std::string Arg("-" + Flag + "=");
    auto IsMatch = [&](const std::string &Other) {
      return Arg.compare(0, std::string::npos, Other, 0, Arg.length()) == 0;
    };
    return std::any_of(Args.begin(), endMutableArgs(), IsMatch);
  }

  // Returns the value of the first instance of a given flag, or an empty string
  // if the flag isn't present.  Ignores any occurrences after
  // "-ignore_remaining_args=1", if present.
  std::string getFlagValue(const std::string &Flag) const {
    std::string Arg("-" + Flag + "=");
    auto IsMatch = [&](const std::string &Other) {
      return Arg.compare(0, std::string::npos, Other, 0, Arg.length()) == 0;
    };
    auto i = endMutableArgs();
    auto j = std::find_if(Args.begin(), i, IsMatch);
    std::string result;
    if (j != i) {
      result = j->substr(Arg.length());
    }
    return result;
  }

  // Like AddArgument, but adds "-[Flag]=[Value]".
  void addFlag(const std::string &Flag, const std::string &Value) {
    addArgument("-" + Flag + "=" + Value);
  }

  // Like RemoveArgument, but removes "-[Flag]=...".
  void removeFlag(const std::string &Flag) {
    std::string Arg("-" + Flag + "=");
    auto IsMatch = [&](const std::string &Other) {
      return Arg.compare(0, std::string::npos, Other, 0, Arg.length()) == 0;
    };
    auto i = endMutableArgs();
    Args.erase(std::remove_if(Args.begin(), i, IsMatch), i);
  }

  // Returns whether the command's stdout is being written to an output file.
  bool hasOutputFile() const { return !OutputFile.empty(); }

  // Returns the currently set output file.
  const std::string &getOutputFile() const { return OutputFile; }

  // Configures the command to redirect its output to the name file.
  void setOutputFile(const std::string &FileName) { OutputFile = FileName; }

  // Returns whether the command's stderr is redirected to stdout.
  bool isOutAndErrCombined() const { return CombinedOutAndErr; }

  // Sets whether to redirect the command's stderr to its stdout.
  void combineOutAndErr(bool combine = true) { CombinedOutAndErr = combine; }

  // Returns a string representation of the command.  On many systems this will
  // be the equivalent command line.
  std::string toString() const {
    std::stringstream SS;
    for (const auto &arg : getArguments())
      SS << arg << " ";
    if (hasOutputFile())
      SS << ">" << getOutputFile() << " ";
    if (isOutAndErrCombined())
      SS << "2>&1 ";
    std::string result = SS.str();
    if (!result.empty())
      result = result.substr(0, result.length() - 1);
    return result;
  }

private:
  Command(Command &&Other) = delete;
  Command &operator=(Command &&Other) = delete;

  std::vector<std::string>::iterator endMutableArgs() {
    return std::find(Args.begin(), Args.end(), ignoreRemainingArgs());
  }

  std::vector<std::string>::const_iterator endMutableArgs() const {
    return std::find(Args.begin(), Args.end(), ignoreRemainingArgs());
  }

  // The command arguments.  Args[0] is the command name.
  std::vector<std::string> Args;

  // True indicates stderr is redirected to stdout.
  bool CombinedOutAndErr;

  // If not empty, stdout is redirected to the named file.
  std::string OutputFile;
};

} // namespace fuzzer
```

该段代码定义了一个 `Command` 类，主要用于管理命令行参数和相关操作。以下是逐部分分析：

### Command类定义
- **`class Command final`**: 定义了一个不可继承的 `Command` 类。

### 公共成员
- **静态方法**:
    - `static inline const char *ignoreRemainingArgs()`: 返回一个字符串，表示命令行参数的结束标志。
- **构造函数**:
    - `Command()`: 默认构造函数，初始化 `CombinedOutAndErr` 为 `false`。
    - `explicit Command(const std::vector<std::string> &ArgsToAdd)`: 接受参数列表并初始化。
    - `explicit Command(const Command &Other)`: 拷贝构造函数，复制其他 `Command` 对象的成员。
- **赋值运算符**:
    - `Command &operator=(const Command &Other)`: 赋值运算符重载，复制成员并返回当前对象的引用。
- **析构函数**:
    - `~Command()`: 默认析构函数。
### 成员函数
- **参数管理**:
    - `bool hasArgument(const std::string &Arg)`: 检查给定参数是否存在。
    - `const std::vector<std::string> &getArguments() const`: 获取当前所有命令行参数。
    - `void addArgument(const std::string &Arg)`: 在标志前添加参数。
    - `void addArguments(const std::vector<std::string> &ArgsToAdd)`: 批量添加参数。
    - `void removeArgument(const std::string &Arg)`: 移除指定参数。

- **标志管理**:
    - `bool hasFlag(const std::string &Flag)`: 检查给定标志是否存在。
    - `std::string getFlagValue(const std::string &Flag)`: 获取标志的值。
    - `void addFlag(const std::string &Flag, const std::string &Value)`: 添加带值的标志。
    - `void removeFlag(const std::string &Flag)`: 移除带值的标志。

- **输出管理**:
    - `bool hasOutputFile() const`: 检查是否有输出文件。
    - `const std::string &getOutputFile() const`: 获取当前输出文件名。
    - `void setOutputFile(const std::string &FileName)`: 设置输出文件名。
    - `bool isOutAndErrCombined() const`: 检查标准错误是否与标准输出合并。
    - `void combineOutAndErr(bool combine = true)`: 设置标准错误与标准输出的合并状态。

- **字符串表示**:
    - `std::string toString() const`: 返回命令的字符串表示，通常是命令行格式。

### 私有成员
- **成员变量**:
    - `std::vector<std::string> Args`: 存储命令行参数。
    - `bool CombinedOutAndErr`: 指示标准错误是否重定向到标准输出。
    - `std::string OutputFile`: 存储输出文件名。

- **私有方法**:
    - `std::vector<std::string>::iterator endMutableArgs()`: 返回可变参数的结束迭代器。
    - `std::vector<std::string>::const_iterator endMutableArgs() const`: 返回可变参数的结束常量迭代器。

## FuzzerIO.h

`FuzzerIO.h`文件主要用于定义模糊测试中的输入输出（IO）相关的函数接口。以下是对代码的逐行分析：

```cpp
#include "FuzzerDefs.h"
```

- [FuzzerDefs.h](#fuzzerdefsh)：定义了一些常量和数据结构。


- **函数声明**：
    - **时间和文件处理**（第18-27行）：
        - `GetEpoch`：获取指定路径的时间戳。
        - `FileToVector`：将文件内容读取到字节向量中。
        - `FileToString`：将文件内容读取为字符串。
        - `CopyFileToErr`：将文件内容复制到标准错误输出。
        - `WriteToFile`：重载函数，用于将数据写入文件。

    - **追加和读取文件**（第32-41行）：
        - `AppendToFile`：将数据追加到文件。
        - `ReadDirToVectorOfUnits`：读取目录中的文件并存储到单位向量中。

    - **路径处理**（第39-48行）：
        - `DirPlusFile`：返回目录和文件名的组合路径。
        - `DirName`：获取文件名的目录部分。
        - `TmpDir`：获取临时目录路径。
        - `TempPath`：生成临时文件路径。

    - **文件特性检查**（第51-53行）：
        - `IsInterestingCoverageFile`：检查文件是否为有趣的覆盖文件。

    - **标准输出和错误处理**（第53-66行）：
        - `DupAndCloseStderr`：复制并关闭标准错误输出。
        - `CloseStdout`：关闭标准输出。

    - **输出文件管理**（第58-59行）：
        - `GetOutputFile`和`SetOutputFile`：获取和设置输出文件。

    - **打印函数**（第61-66行）：
        - `Puts`、`Printf`、`VPrintf`：用于输出字符串和格式化输出。

    - **平台特定函数**（第68-72行）：
        - `IsFile`、`IsDirectory`、`FileSize`：检查路径是否为文件或目录，并获取文件大小。

    - **目录操作**（第73-85行）：
        - `ListFilesInDirRecursive`：递归列出目录中的文件。
        - `MkDirRecursive`和`RmDirRecursive`：递归创建和删除目录。
        - `IterateDirRecursive`：递归遍历目录，执行回调函数。

- **结构体定义**（第87-90行）：
    - `SizedFile`：包含文件名和大小，并重载小于运算符。

- **文件处理函数**（第93-112行）：
    - `GetSizedFilesFromDir`：获取目录中所有文件及其大小。
    - `OpenFile`、`CloseFile`、`DuplicateFile`、`RemoveFile`、`RenameFile`等函数用于文件的打开、关闭、复制、删除和重命名。

## FuzzerDefs.h

`FuzzerDefs.h`文件主要用于定义模糊测试中的基本数据结构和函数接口。
```cpp
#include <cassert>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <memory>
#include <set>
#include <string>
#include <vector>
```

- `cassert`：定义了一些宏，用于在程序中插入调试断言。
- `cstddef`：定义了一些与C标准库相关的宏。
- `cstdint`：定义了一些标准的整数类型，如 `int8_t`、`int16_t`、`int32_t`、`int64_t`、`uint8_t`、`uint16_t`、`uint32_t`、`uint64_t` 等。
- `cstring`：定义了一些与C标准库相关的宏。
- `memory`：定义了一些与内存操作相关的函数。
- `set`：定义了一些与集合操作相关的函数。
- `string`：定义了一些与字符串操作相关的函数。
- `vector`：定义了一些与向量操作相关的函数。

```cpp
template <class T> T Min(T a, T b) { return a < b ? a : b; }
template <class T> T Max(T a, T b) { return a > b ? a : b; }
```

- **模板函数**：
    - `Min`函数：返回两个值中的较小者。
    - `Max`函数：返回两个值中的较大者。

```cpp
class Random;
class Dictionary;
class DictionaryEntry;
class MutationDispatcher;
struct FuzzingOptions;
class InputCorpus;
struct InputInfo;
struct ExternalFunctions;

// Global interface to functions that may or may not be available.
extern ExternalFunctions *EF;
```

- **类和结构的前向声明**：声明了多个类和结构

```cpp
typedef std::vector<uint8_t> Unit;
typedef std::vector<Unit> UnitVector;
typedef int (*UserCallback)(const uint8_t *Data, size_t Size);
```

- **类型定义**：
    - `Unit`：定义为`std::vector<uint8_t>`，表示一个字节数组。
    - `UnitVector`：定义为`std::vector<Unit>`，表示多个字节数组的集合。
    - `UserCallback`：定义为一个函数指针类型，接受字节数据和大小作为参数。

```cpp
int FuzzerDriver(int *argc, char ***argv, UserCallback Callback);

uint8_t *ExtraCountersBegin();
uint8_t *ExtraCountersEnd();
void ClearExtraCounters();
```

- **函数声明**：
    - `FuzzerDriver`：主驱动函数，接受命令行参数和用户回调函数。
    - `ExtraCountersBegin`和`ExtraCountersEnd`：用于获取额外计数器的起始和结束地址。
    - `ClearExtraCounters`：清除额外计数器的函数。

```cpp
extern bool RunningUserCallback;
```

- **全局变量**：声明了一个外部布尔变量`RunningUserCallback`，可能用于指示用户回调是否正在运行。


## FuzzerUtil.h

```cpp
#include "FuzzerBuiltins.h"
#include "FuzzerBuiltinsMsvc.h"
#include "FuzzerCommand.h"
#include "FuzzerDefs.h"
```

- [FuzzerBuiltins.h](#fuzzerbuiltinsh)：定义了一些包装函数和宏。
- [FuzzerBuiltinsMsvc.h](#fuzzerbuiltinsmsvch)：在MSVC编译器下提供一些内置函数的替代实现。
- [FuzzerCommand.h](#fuzzercommandh)：定义了一些命令行参数相关的函数。
- [FuzzerDefs.h](#fuzzerdefsh)：定义了一些常量和数据结构。



