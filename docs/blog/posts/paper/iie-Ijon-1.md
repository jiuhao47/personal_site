---
draft: false
date: 2024-09-17
authors:
  - Jiuhao 
categories: 
  - Fuzz
  - Paper Reading Notes
tags:
  - Fuzz
  - IIE
---

# 论文精读：IJON: Exploring Deep State Spaces via Fuzzing （更新中）

[IJON: Exploring Deep State Sapces via Fuzzing](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9152719)

[IJON SPACE EXPLORER Github](https://github.com/RUB-SysSec/ijon)

<!-- more -->

## 背景与挑战

> there are still many situations such as complex state machines where fully automated approaches fail.

- 传统的fuzzing技术在探索深层状态空间时效果不佳

> State-of-the-art fuzzing methods offer very limited ability for a human to interact and aid the fuzzer in such cases

- 现有的fuzzing方法对人类干预的支持有限

> More specifically, most current approaches are limited to adding a dictionary or new seed inputs to guide the fuzzer. When dealing with complex programs, these mechanisms are unable to uncover new parts of the code base.

- 大多数现有方法仅限于添加字典或新种子输入来引导fuzzer。在处理复杂程序时，这些机制无法发现代码库的新部分。

> Even with clever program analysis techniques such as symbolic or concolic execution, some constraints cannot be overcome easily.

- 即使使用了符号执行或[共享执行](#concolic-execution)等聪明的程序分析技术，也无法轻松克服一些约束。 

<!--TODO: 什么是concolic execution-->

> Furthermore, in some cases, state explosion proves too much of a hindrance to current techniques—whether they are fuzzing or symbolic execution based approaches. This is due to the fact that the underlying problem (finding bugs) is undecidable in the general case. As a result, we cannot expect that any single algorithm will perform very well across all target applications that are tested.

- 此外，在某些情况下， **状态爆炸** 对当前技术构成了太大的障碍——无论是基于fuzzing还是基于符号执行的方法。这是因为底层问题（查找错误）在一般情况下是不可判定的。因此，我们不能期望 **任何单个算法** 在所有测试的目标应用程序上表现非常好。

> Since each update to the state data is triggered by certain code, a coverage-based fuzzer is able to explore each individual update in isolation. However, there is no feedback that rewards exploring combinations of different updates leading to new states, if all individual updates have been observed previously. In cases where a specific sequence of updates is needed to uncover a bug, this prevents the fuzzer from making progress.

- 由于状态数据的每次更新都是由某些代码触发的，基于覆盖率的fuzzer能够独立地探索每个单独的更新。然而，如果所有单独的更新都已经被观察到，那么没有反馈会奖励探索 **导致新状态的不同更新** 的组合。在 **需要特定的更新序列** 来发现错误的情况下，这将阻止fuzzer取得进展。

> Similarly, concolic execution based approaches fail, since the exact sequence of updates (and consequently the precise code path chosen) is critical to uncover the bug. Since concolic execution fixes the path to the observed execution path, it is impossible for the solver to obtain an input that triggers the target condition. Lastly, even fully symbolic execution, which is free to explore different paths, fails if the state space grows too large.

- 同样，基于共享执行的方法也会失败，因为 **更新的确切顺序**（因此选择的确切代码路径）对于发现错误至关重要。由于共享执行固定了路径到观察到的执行路径，求解器无法获得触发目标条件的输入。最后，即使是完全符号执行，如果状态空间变得太大，也会失败。

> We note that there is a trend to use more complex solutions, which only support minimal environments/instruction sets, based on symbolic execution to overcome harder challenges in fuzzing On the downside, as observed by various sources, such methods sometimes scale poorly to complex applications.

- 我们注意到，有一种趋势是使用更复杂的解决方案，这些解决方案仅支持基于符号执行的最小环境/指令集，以克服fuzzing中更难的挑战。然而，正如各种来源观察到的那样，这种方法有时在复杂应用程序中的 **扩展性** 较差。

> Generally speaking, a fuzzer tries to sample from “interesting” regions of the state space as efficiently as possible. However, it is hard to find an accurate and objective metric for how “interesting” the state space of any given input is.

- 一般来说，fuzzer试图尽可能高效地从状态空间的“有趣”区域中采样。然而，很难找到 **任何给定输入的状态空间有多“有趣”的准确和客观的度量标准** 。

> However, there are code constructs where this approach is unlikely to reach new coverage without exploring intermediate points in the state space.

- 然而，有些代码结构，如果不探索状态空间中的中间点，这种方法很难达到新的覆盖。


## IJON的想法与设计

> IJON, an annotation mechanism that a human analyst can use to guide the fuzzer 

> In contrast to the two aforementioned techniques (adding a dictionary or new seed inputs), this approach allows a more systematic exploration of the program’s behavior **based on the data representing the internal state of the program**

- 相较于前面提到的添加字典或新种子，其基于程序内部状态的数据，允许更系统地探索程序的行为

> We extended various AFL-based fuzzers with the ability to annotate the source code of the target application with guidance hints.


- 通过在目标应用程序的源代码中添加指导提示，扩展了各种基于AFL的fuzzer的功能

> Our evaluation demonstrates that such simple annotations are able to solve problems that—to the best of our knowledge—no other current fuzzer or symbolic execution based tool can overcome. 

> To further demonstrate the capabilities of our annotations, we use AFL combined with IJON to uncover both novel security issues and issues that previously required a custom and comprehensive grammar to be uncovered.

- 评估表明，这种简单的注释能够解决我们所知道的其他任何当前fuzzer或基于符号执行的工具无法克服的问题。

- 为了进一步展示我们的注释的能力，我们使用AFL结合IJON来发现新的安全问题和以前需要自定义和全面的语法才能发现的问题。

<!--TODO: 什么是comprehensive grammar-->

> As a result, much attention was placed on further improving fuzzing methods, often to achieve greater code coverage and reach deeper into a given software application.

- 因此，人们更加关注进一步改进fuzzing方法，通常是 **为了实现更大的代码覆盖率，并深入到给定软件应用程序中** 。

> Our approach is also motivated by the observation that many fuzzing practitioners in the industry already use a closed feedback loop in their fuzzing process

- 我们的方法也受到这样的观察的启发：许多行业中的fuzzing从业者已经在他们的fuzzing过程中使用了一个 **封闭的反馈循环**

> First, they run the fuzzer for some time and then analyze the resulting code coverage. After this manual analysis, they tweak and adapt the fuzzing process to increase coverage. Common strategies for improving the fuzzing performance include removing challenging aspects from the target application (e.g., checksums), changing the mutation strategies, or explicitly adding input samples that solve certain constraints that the fuzzer did not generate in an automated way.This approach has two main reasons: on the one hand, all the “easy” bugs (i.e., the ones which can be found fully automatically) are found very quickly during a fuzzing campaign. On the other hand, the more interesting bugs are—by definition—the ones that cannot be found using current tools in off-the-shelf configurations and hence, some manual tuning is required. We believe that by assisting and steering the fuzzing process, humans interacting with fuzzers allow for a vastly increased ability to analyze applications and overcome many of the current obstacles related to fuzzing of complex applications.

首先，他们运行fuzzer一段时间，然后分析生成的代码覆盖率。在这种手动分析之后，他们 **调整和适应fuzzing过程以增加覆盖率** 。改进fuzzing性能的常见策略包括: 

- 从目标应用程序中删除具有挑战性的方面（例如，校验和）
- 更改变异策略
- 明确添加解决fuzzer未以自动方式生成的某些约束的输入样本。

这种方法有两个主要原因：

- 在fuzzing活动期间，所有“容易”发现的错误（即，可以完全自动发现的错误）都会很快被发现。
- 更有趣的错误——根据定义——是那些不能使用当前工具在现成配置中找到的错误，因此，需要一些手动调整。

通过协助和引导fuzzing过程，与fuzzer互动的人类可以大大增加分析应用程序的能力，并克服与fuzzing复杂应用程序相关的许多当前障碍。

> Specifically, we focus on a particular class of challenges: we observe that current fuzzers are not able to properly explore the state space of a program beyond code coverage. For example, program executions that result in the same code coverage, but different values in the state, cannot be explored appropriately by current fuzzers. In general, the problem of exploring state is challenging, as it is difficult to automatically infer which values are interesting and which are not. However, a human with a high-level understanding of the program’s goals, often knows which values are relevant and which are not.

- 具体来说，我们关注一类特定的挑战：我们观察到，当前的fuzzer无法适当地探索程序的状态空间，超出了代码覆盖范围。例如，导致相同代码覆盖率但状态值不同的程序执行，无法被当前的fuzzer适当地探索。一般来说，探索状态的问题是具有挑战性的，因为很难 **自动推断哪些值是有趣的，哪些值是无趣的** 。然而，对于程序目标有高级理解的人，通常知道哪些值是相关的，哪些值是不相关的。

<!--TODO: we observe that current fuzzers are not able to properly explore the state space of a program beyond code coverage ?-->

> a human analyst can annotate parts of the state space that should be explored more thoroughly, hence modifying the feedback function the fuzzer can use. The required annotations are typically small, often only one or two lines of additional code are needed.

- 人类分析师可以注释应该更彻底地探索的状态空间的部分，从而修改fuzzer可以使用的反馈函数。通常只需要很少的注释，通常只需要一两行额外的代码。

 > To demonstrate the practical feasibility of the proposed approach, we extended various AFL-based fuzzers with the ability to annotate the source code of the target application with hints to guide the fuzzer.

- 为了证明所提出的方法的实际可行性，我们扩展了各种基于AFL的fuzzer的功能，使其能够用提示注释目标应用程序的源代码，以指导fuzzer。

> The overall success of AFL and its derivative demonstrates that following the edge coverage is an effective metric to identify new interesting regions. Edge coverage is probably the feature with the best signal to noise ratio in practice— after all, in most (i.e., not obfuscated) programs, each new edge indicates a special case

- AFL及其衍生产品的整体成功证明，遵循边覆盖是识别新有趣区域的有效指标。边覆盖可能是实践中信噪比最好的特征——毕竟，在大多数（即非混淆的）程序中，每个新边都表示一个特殊情况

### State Exploration

> *Known Relevant State Values*: Sometimes, code coverage adds no feedback to help the fuzzer to advance. If only a small subset of the states is interesting and a human analyst is able to identify these values, we can directly use them to guide the fuzzer.

- *已知相关状态值*：有时，代码覆盖不提供任何反馈来帮助fuzzer前进。如果只有一个小的状态子集是有趣的，并且人类分析师能够识别这些值，我们可以直接使用它们来指导fuzzer。

> *Known State Changes*: Sometimes, the program is too complex, or it is not obvious which variables contain interesting state and which ones do not. In such situations, since no sufficiently small set of relevant state values are known to us, we cannot directly use them to guide the fuzzer. Instead, a human analyst might be able to identify positions in the code that are suspected to mutate the state. An analyst can use the history of such state changes as an abstraction for the more complex state and guide the fuzzer. For example, many programs process messages or chunks of inputs individually. Processing different types of input chunks most likely mutates the state in different ways.

- *已知状态变化*：有时，程序太复杂，或者不明显哪些变量包含有趣的状态，哪些变量不包含。在这种情况下，由于我们不知道足够小的相关状态值集，我们无法直接使用它们来指导fuzzer。相反，人类分析师可能能够识别代码中的位置，怀疑会改变状态。分析师可以使用这种状态变化的历史作为更复杂状态的抽象，并指导fuzzer。例如，许多程序逐个处理消息或输入块。处理不同类型的输入块很可能以不同的方式改变状态。

> *Missing Intermediate State*: Unlike the previous two cases, there might be neither variables that contain the state, nor code that mutates the state that we care about. In such situations, an analyst can create artificial intermediate states to guide the fuzzer.

## 概念

### Concolic Execution

> Concolic testing (a portmanteau of concrete and symbolic, also known as dynamic symbolic execution) is a hybrid software verification technique that performs symbolic execution, a classical technique that treats program variables as symbolic variables, along a concrete execution (testing on particular inputs) path. Symbolic execution is used in conjunction with an automated theorem prover or constraint solver based on constraint logic programming to generate new concrete inputs (test cases) with the aim of maximizing code coverage. Its main focus is finding bugs in real-world software, rather than demonstrating program correctness.

- 共享测试（concolic testing）是一种混合软件验证技术，它执行符号执行，这是一种将程序变量视为符号变量的经典技术，沿着具体执行（在特定输入上进行测试）路径。符号执行与基于约束逻辑编程的自动定理证明器或约束求解器结合使用，以生成新的具体输入（测试用例），目的是最大化代码覆盖率。它的主要重点是在现实世界的软件中查找错误，而不是证明程序的正确性指定版本

### CGC data set

[Cancer Gene Census](https://cancer.sanger.ac.uk/census)

> The Cancer Gene Census (CGC) is an ongoing effort to catalogue those genes which contain mutations that have been causally implicated in cancer and explain how dysfunction of these genes drives cancer. The content, the structure, and the curation process of the Cancer Gene Census was described and published in Nature Reviews Cancer.

- 癌症基因普查（CGC）是一个持续的努力，旨在编目那些包含已被认为与癌症有因果关系的突变的基因，并解释这些基因的功能障碍如何驱动癌症。癌症基因普查的内容、结构和策划过程已在《自然评论癌症》中描述和发表。

### TPM (Trusted Platform Module)

[Trusted Platform Module (Wikipedia)](https://en.wikipedia.org/wiki/Trusted_Platform_Module)

> Trusted Platform Module (TPM) is an international standard for a secure cryptoprocessor, a dedicated microcontroller designed to secure hardware through integrated cryptographic keys. The term can also refer to a chip conforming to the standard ISO/IEC 11889. Common uses are to verify platform integrity (to verify that the boot process starts from a trusted combination of hardware and software), and to store disk encryption keys.

- 受信任平台模块（TPM）是一个用于安全加密处理器的国际标准，是一种专用的微控制器，旨在通过集成的加密密钥保护硬件。该术语也可以指符合标准ISO/IEC 11889的芯片。常见用途是验证平台完整性（验证引导过程是否从受信任的硬件和软件组合开始），以及存储磁盘加密密钥。

### AFL-based fuzzers

[AFL](https://github.com/google/fuzzing/blob/master/docs/afl-based-fuzzers-overview.md)

> AFL is a coverage-guided, or feedback-based, fuzzer. More about these concepts can be found in a cool paper, Fuzzing: Art, Science, and Engineering. Let's wrap up general information about AFL:It modifies the executable file to find out how it influences coverage. Mutates input data to maximize coverage. Repeats the preceding step to find where the program crashes. It’s highly effective, which is proven by practice. It’s very easy to use.

- AFL是一种覆盖率引导或反馈式fuzzer。关于这些概念的更多信息可以在一篇很酷的论文《Fuzzing: Art, Science, and Engineering》中找到。让我们总结一下关于AFL的一般信息：它修改可执行文件以找出它如何影响覆盖率。变异输入数据以最大化覆盖率。重复上一步骤以找出程序崩溃的位置。它非常有效，这是通过实践证明的。它非常容易使用。

> This class of fuzzers typically uses code coverage to decide if an input reaches sufficiently different state than the ones existing in the corpus.

- 这类fuzzer通常使用代码覆盖率来决定输入是否达到了与语料库中现有状态足够不同的状态。

#### AFL Coverage Feedback

> Various forks of AFL use instrumentation to obtain test coverage information. Typically, AFL-style fuzzers track how often individual edges in the control flow graph (CFG) are executed during each test input. There are two classes of feedback mechanisms commonly used: source code based forks of AFL typically use a custom compiler pass that annotates all edges with a custom piece of code. Binary-only versions of AFL use different mechanisms such as Dynamic Binary Instrumentation (DBI) or hardware accelerated tracing (typically Intel LBR or Intel PT) to obtain coverage information. Either way, the probes inserted into the target application then count the occurrences of each edge in the CFG and store them in a densely encoded representation.

- AFL的各种分支使用插桩来获取测试覆盖信息。通常，AFL风格的fuzzer跟踪控制流图（CFG）中的单个边在每个测试输入中执行的次数。通常使用两类常用的反馈机制：基于源代码的AFL分支通常使用自定义编译器插件，该插件使用自定义代码片段注释所有边。AFL的仅二进制版本使用不同的机制，例如动态二进制仪器（DBI）或硬件加速跟踪（通常是Intel LBR或Intel PT）来获取覆盖信息。无论哪种方式，插入到目标应用程序中的探针都会计算CFG中每个边的发生次数，并将其存储在密集编码的表示中。

> The resulting information is stored in a shared map that accumulates all edge counts during each test run. The fuzzer additionally maintains a global bitmap that contains all edge coverage encountered during the whole fuzzing campaign. The global bitmap is used to quickly check if a test input has triggered new coverage. AFL considers a test input interesting and stores it if it contains a previously unseen number of iterations on any edge. Since edges always connect two basic blocks, edges are encoded as a tuple consisting of two identifiers, one for the source basic block $id_s$ and one for a target block $id_t$. In the source code based versions, a static random value is assigned at compile-time to each basic block, which is used as $id_s$ or $id_t$. For binary-only implementations, it is common to use a cheap hash function applied to the address of the jump instruction/target instruction to derive the $id_s$ and $id_t$ values, respectively. This tuple ($id_s$, $id_t$) is then used to index a byte in the shared map. Typically, the index is calculated as $ (id_s \times 2) \oplus id_t $. The multiplication is used to efficiently distinguish self-loops.

- 结果信息存储在一个共享图（映射？）中，该图（映射？）在每次测试运行期间累积所有边的计数。fuzzer还维护一个全局[位图](#bitmap-data-structure)，其中包含整个fuzzing活动期间遇到的所有边覆盖。全局位图用于快速检查测试输入是否触发了新的覆盖。如果测试输入包含任何边上以前未见的迭代次数，则AFL认为测试输入有趣并将其存储。由于边始终连接两个基本块，因此边被编码为一个由两个标识符组成的元组，一个用于源基本块$id_s$，一个用于目标块$id_t$。在基于源代码的版本中，每个基本块在编译时被分配一个静态随机值，该值用作$id_s$或$id_t$。对于仅二进制实现，通常使用应用于跳转指令/目标指令地址的便宜哈希函数来分别推导$id_s$和$id_t$值。然后，这个元组（$id_s$，$id_t$）用于索引共享图（映射？）中的一个字节。通常，索引计算为$ (id_s \times 2) \oplus id_t $。乘法用于有效区分自环。

<!--TODO: 这里是应该翻译成图还是映射-->

> Before each new test run, the shared map is cleared. During the test run, each time an edge is encountered, the corresponding byte in the shared map is incremented. This implies that edge counts greater than 255 will overflow and might register as any number between 0 and 255. After the execution finished, the edge counts are bucketed such that each byte in the shared map with a non-zero edge count contains a power of 2. To this end, edge counts are discretized into the following ranges 1, 2, 3, 4 . . . 7, 8 . . . 15, 16 . . . 31, 32 . . . 127, 128 . . . 255. Each range of edge counts is assigned to one specific power of 2. To increase the precision on uncommon edges, 3 also maps to a unique power of 2, while the range 32 to 64 is omitted. Then we can compare the shared map against a global bitmap, which contains all bits that were previously observed in prior runs. If any new bit is set, the test input is stored because it has led to increased coverage, and the global bitmap is updated to contain the new coverage.

- 在每次新的测试运行之前，共享图（映射？）被清除。在测试运行期间，每次遇到一个边，共享图（映射？）中的相应字节就会增加。这意味着边计数大于255将溢出，并可能注册为0到255之间的任何数字。执行完成后，边计数被[分桶](#bucketed)，以便共享图（映射？）中具有非零边计数的每个字节都包含2的幂。为此，边计数被离散化为以下范围1、2、3、4...7、8...15、16...31、32...127、128...255。每个边计数范围都分配给一个特定的2的幂。为了增加对不常见边的精度，3也映射到一个唯一的2的幂，而32到64的范围被省略。然后，我们可以将共享图（映射？）与全局位图进行比较，全局位图包含以前运行中观察到的所有位。如果设置了任何新位，测试输入将被存储，因为它导致了覆盖率的增加，并且全局位图被更新以包含新的覆盖率。

### Extending Feedback Beyond Coverage

> Fuzzers sometimes get stuck in a part of the search space, where no reasonable, probable mutation provides any new feedback.

- fuzzer有时会卡在搜索空间的某个部分，没有合理的、可能的变异提供任何新的反馈。

> Notably, LAF-INTEL was an early approach to solve magic byte type constraints (e.g., if (input == 0xdeadbeef)) by splitting large compare instructions into multiple smaller ones.

- 值得注意的是，LAF-INTEL是一种早期的方法，用于解决魔术字节类型约束（例如，`if (input == 0xdeadbeef)`），通过将大的比较指令分成多个较小的指令。

> The same idea was later implemented by using dynamic binary instrumentation in a tool called STEELIX. Splitting multi-byte compare instructions into multiple single byte instructions allows the fuzzer to find new coverage every time a single byte of the operands is matching. ANGORA assigns a random identifier to each function. It uses these identifiers to extend the coverage tuple by a third field that contains a hash of the current execution context. To compute this hash, it combines all identifiers of functions that have been called but have not yet returned (i.e., active functions) using an XOR operation. This allows finding the “same” coverage if it was used in a different calling context. For example, this method is helpful to solve multiple calls to the strcmp function. However, the downside of this approach (i.e., considering all calling contexts as unique) is that in certain situations, this creates a large number of inputs that are actually not interesting. Therefore, ANGORA requires a larger bitmap than AFL.

- 后来，使用动态二进制插桩在一个名为STEELIX的工具中实现了相同的想法。将多字节比较指令分成多个单字节指令，使fuzzer每次操作数的单字节匹配时都能找到新的覆盖。ANGORA为每个函数分配一个随机标识符。它使用这些标识符将覆盖元组扩展为包含当前执行上下文的哈希的第三个字段。为了计算这个哈希，它使用XOR操作结合所有已调用但尚未返回的函数的标识符（即活动函数）。这允许在不同的调用上下文中使用相同的覆盖。例如，这种方法有助于解决对strcmp函数的多次调用。然而，这种方法的缺点（即将所有调用上下文视为唯一）是，在某些情况下，这会创建大量实际上不感兴趣的输入。因此，ANGORA需要比AFL更大的位图。
### Bucketed

分桶（Bucketing）是一种数据处理和存储技术，通常用于将数据分成多个组或“桶”。每个桶包含一部分数据，便于管理和分析。分桶的主要目的包括：

- **提高查询性能**：通过将数据分散到不同的桶中，可以减少每次查询需要扫描的数据量。
- **负载均衡**：在分布式系统中，分桶可以帮助均匀分配数据到不同的节点，避免某些节点过载。
- **简化数据管理**：将数据分成小块可以更容易地进行更新、删除和维护。

分桶常用于数据库、数据仓库和大数据处理框架中。


### Bitmap data structure

[位图数据结构](https://blog.csdn.net/bit_pan/article/details/141755895)

位图（Bitmap）是一种非常高效的数据结构，主要用于处理大量数据的快速查找、去重等操作。它利用每一位（bit）来表示某个元素是否存在或某种状态，从而极大地节省了存储空间。在内存和存储空间相对受限的环境下，位图尤其有用。

### State

> state denotes one configuration of memory and registers, as well as the state provided by the OS (e.g., file descriptors and similar primitives).

- 状态表示内存和寄存器的一个配置，以及操作系统提供的状态（例如，文件描述符和类似的原语）。
### State Space

> The state space is the set of all possible states a program can be in.

- 状态空间是程序可能处于的所有可能状态的集合。

## 有趣的话

> Computers are incredibly fast, accurate and stupid; humans are incredibly slow, inaccurate and brilliant; together they are powerful beyond imagination

- 计算机非常快速、准确和愚蠢；人类非常缓慢、不准确和聪明；在一起，他们的力量超乎想象。

> Since even for trivially small programs, the state space is larger than the number of atoms in the universe, the fuzzer has to optimize the diversity of states reached by the test cases.

- 由于即使对于微不足道的小程序，状态空间也比宇宙中的原子数量还要大，因此fuzzer必须优化测试用例达到的状态的多样性。
