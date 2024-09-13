---
draft: false
date: 2024-09-13
authors:
  - Jiuhao 
categories: 
  - Fuzz
tags:
  - Fuzz
  - IIE
---

# 记第一次论文研讨

> [NEZHA: Efficient Domain-Independent Differential Testing](https://ieeexplore.ieee.org/document/7958601/?arnumber=7958601) 

<!-- more -->

## 前言

属于是刚开始做没什么经验，昨天看到老师发的问题模板：

- 这篇文章讲了什么
- 学到哪些重要概念
- 你认为它好的地方
- 不解的地方，想要进一步交流

今天赶工总结一下前两天阅读Paper的过程及收获，写一个Blog吧。

以后可能会不定期更新这个Blog专栏，更新频次随机

## 论文简介

> 这篇文章讲了什么

NEZHA，一种高效的、与领域无关的差分测试框架。

- 差分测试的挑战：
    - 大多数差分测试工具依赖于输入格式的领域特定知识，难以适应新的领域。
    - 现有工具在发现语义错误时效率较低，需要大量输入才能找到单个错误。
    - 许多工具使用为发现崩溃或内存损坏错误而设计的技术生成输入，忽略了测试程序之间的行为不对称性。
- NEZHA的设计：
    - 利用多个测试程序之间的行为不对称性，专注于更可能触发语义错误的输入。
    > For the rest of the paper, we focus on using differential testing to discover program discrepancies in this setting, i.e., where at least one test program validates and accepts an input and another program with similar functionality rejects the same input as invalid
    - 引入了δ-分集(δ-diversity)概念，用于总结多个测试应用程序之间观察到的行为不对称性。
- 输入生成机制：设计了两种高效的、与领域无关的输入生成机制，一种是灰盒的，另一种是黑盒的。
    - 灰盒输入生成机制：这种机制在程序执行时收集详细的运行时信息，例如控制流图（CFG）中的路径。通过跟踪多个测试程序的执行路径，灰盒机制可以生成更有可能触发语义错误的输入。
    - 黑盒输入生成机制：这种机制不需要程序的内部信息，而是基于程序的输出（如错误信息、返回值等）来生成输入。通过观察不同程序在相同输入下的输出差异，黑盒机制可以有效地发现语义错误。
- 实验结果：NEZHA在发现语义错误方面比现有工具更高效，平均发现差异的速度比Frankencerts和Mucerts分别高52倍和27倍。

## 重要概念

> 学到哪些重要概念

### 证书

证书是一种数字文档，用于验证实体（如个人、组织或设备）的身份。它通常由受信任的第三方（称为证书颁发机构，CA）签发，并包含以下关键元素：

- 公钥：用于加密和解密数据。
- 持有者信息：包括持有者的名称、组织等。
- 颁发者信息：包括颁发证书的CA的名称和签名。
- 有效期：证书的有效起始和结束日期。
- 序列号：唯一标识证书的编号。

证书在网络安全中起着重要作用，特别是在SSL/TLS协议中，用于确保网络通信的安全性。

### 语义漏洞（Semantic Bug）

语义漏洞是指程序在逻辑上存在的缺陷，攻击者可以利用这些缺陷，通过构造符合规则但不符合预期的输入来攻击程序。这类漏洞不会表现出明显的错误行为（如崩溃或断言失败），因此很难被发现

> Semantic bugs are errors in software that cause it to deviate from its intended behavior or specifications without causing obvious failures like crashes

### δ-分集（δ-diversity）(Differential-diversity)

δ分集（δ-diversity）是一种用于总结多个测试程序之间行为不对称性的方法。它通过跟踪测试程序在执行过程中观察到的行为差异，来指导输入生成过程，以更有效地发现语义错误。

> We introduce the notion of δ-diversity, which summarizes the observed asymmetries between the behaviors of multiple test applications. Based on δ-diversity, we design two efficient domain-independent input generation mechanisms for differential testing, one gray-box and one blackbox. We demonstrate that both of these input generation scheme

### 差分测试（Differential Testing）

差分测试是一种使用相似程序作为交叉参考来发现语义错误的方法，这些错误不会表现出明显的错误行为，如崩溃或断言失败。差分测试通过比较多个测试程序的行为不对称性，专注于更可能触发语义错误的输入

> Differential testing uses similar programs as cross-referencing oracles to find semantic bugs that do not exhibit explicit erroneous behaviors like crashes or assertion failures. By comparing the behavioral asymmetries between multiple test programs, it focuses on inputs that are more likely to trigger semantic bugs

### 程序插桩（Program Instrumentation）

程序插桩（Instrumentation）是一种在程序运行时收集信息的技术。通过在程序的特定位置插入代码，可以监控程序的行为，例如执行路径、内存使用情况和函数调用等。这些信息对于调试、性能分析和安全检测非常有用

### 二进制重写（Binary Rewriting）
二进制重写（Binary Rewriting）是一种技术，用于在不需要源代码的情况下修改已编译的二进制文件。它可以用于多种目的，包括性能优化、安全性增强、错误修复和功能添加。二进制重写通常涉及以下步骤：

- 解析二进制文件：分析二进制文件的结构和内容。
- 修改代码或数据：根据需要插入、删除或替换指令或数据。
- 重组二进制文件：确保修改后的二进制文件仍然是有效的可执行文件

### 控制流图（CFG）

CFG 是控制流图（Control Flow Graph）的缩写。它是一种图形表示法，用于描述程序中各个基本块（basic blocks）之间的控制流关系。基本块是指一段没有分支的代码序列，控制流图通过节点和边来表示程序的执行路径，其中节点代表基本块，边代表控制流的转移

### 粒度

粒度是指软件系统中各个组件之间的关联程度。粒度越细，组件之间的关联越小，系统的模块化程度越高。粒度的选择对软件系统的性能、可维护性和扩展性等方面都有影响

## 论文创新点

> 你认为它好的地方

> @方老师：这篇文章的核心在于其提出了一种新的程序执行不正确的描述方式（Unexpected Execution）

## 不解之处

> 不解的地方，想要进一步交流

### 概念-δ分集及其在模糊测试中的效率提升原理

> @方老师：实际这篇文章的核心不在δ分集上，且其实验效果也存在一点点trick

## 讨论总结

- 重点：如何定义程序的正确性
    - Unexpected Execution(e.g. 缓冲区溢出，内存泄漏，Use after free)
        - 人工测试(Bug Oracle)
        - 差分测试
- 任务：
    - 概念理解：
        - 程序插桩
    - 文章阅读：
        - 精读 NEZHA: Efficient Domain-Independent Differential Testing (2遍)
        - 精读 IJON: Exploring Deep State Spaces via Fuzzing
    - 源码阅读：
        - libfuzzer的源码
    - 源码执行：
        - libfuzzer的源码
        - NEZHA的源码
- 注意：
    - 做好阅读过程中的问题记录，及时反馈

### 常态化（组会）

下次时间：2024-09-21
