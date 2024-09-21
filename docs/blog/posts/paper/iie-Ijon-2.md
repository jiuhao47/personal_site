---
draft: false
date: 2024-09-19
authors:
  - Jiuhao 
categories: 
  - Fuzz
  - Discussion
tags:
  - Fuzz
  - IIE
---

# 记第二次论文研讨

<!-- more -->

## IJON: Exploring Deep State Spaces via Fuzzing

[IJON: Exploring Deep State Sapces via Fuzzing](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9152719)

[IJON SPACE EXPLORER Github](https://github.com/RUB-SysSec/ijon)

### 背景与挑战

- 传统的fuzzing技术在探索 **深层状态空间** 时效果不佳

- 现有的fuzzing方法对 **人类干预** 的支持有限

- 大多数现有方法仅限于添加 **字典或新种子** 输入来引导fuzzer。处理复杂程序时这些机制无法发现代码库的新部分。符号执行或共享执行等程序分析技术也无法轻松克服一些约束。 

- **状态爆炸** 对当前技术构成了太大的障碍——无论是基于fuzzing还是基于符号执行的方法。这是因为底层问题（查找错误）在一般情况下是不可判定的。因此，我们不能期望 **任何单个算法** 在所有测试的目标应用程序上表现非常好。

- 如果所有单独的更新都已经被观察到，那么没有反馈会奖励探索 **导致新状态的不同更新** 的组合。在 **需要特定的更新序列** 来发现错误的情况下，这将阻止fuzzer取得进展。

- **更新的确切顺序**（因此选择的确切代码路径）对于发现错误至关重要。由于共享执行固定了路径到观察到的执行路径，求解器无法获得触发目标条件的输入。最后，即使是完全符号执行，如果状态空间变得太大，也会失败。

- 更复杂的解决方案仅支持基于符号执行的最小环境/指令集，有时在复杂应用程序中的 **扩展性** 较差。

- 很难找到 **任何给定输入的状态空间有多“有趣”的准确和客观的度量标准** 。

- 有些代码结构不探索状态空间中的 **中间点** 很难达到新的覆盖。

### IJON的想法与设计

- 相较于前面提到的添加字典或新种子，其基于 **程序内部状态的数据** ，允许更系统地探索程序的行为

- 通过在目标应用程序的源代码中添加 **指导提示** ，扩展了各种基于AFL的fuzzer的功能

- **对于程序目标有高级理解的人**，通常知道哪些值是相关的，哪些值是不相关的。人类分析师可以注释应该更彻底地探索的状态空间的部分，从而修改fuzzer可以使用的反馈函数。

#### Fuzzing 从业者的封闭反馈循环

运行fuzzer一段时间，分析生成的代码覆盖率。**人工调整和适应fuzzing过程以增加覆盖率** 。改进fuzzing性能的常见策略包括: 

- 从目标应用程序中 **删除具有挑战性的方面**（例如，校验和）
- **更改变异策略**
- **明确添加** 解决fuzzer未以自动方式生成的 **某些约束的输入样本**。

这种方法有两个主要原因：

- 在fuzzing活动期间，所有“容易”发现的错误（即，可以完全自动发现的错误）都会很快被发现。
- 更有趣的错误——根据定义——是那些不能使用当前工具在现成配置中找到的错误，因此，需要一些手动调整。

#### 如何更深入的探索状态空间


- **已知相关状态值**：有时代码覆盖不提供任何反馈来帮助fuzzer前进。如果只有一个小的状态子集是有趣的，并且人类分析师能够识别这些值，我们可以直接使用它们来指导fuzzer。(迷宫的分支覆盖并不是一个好的指标)

- **已知状态变化**：有时程序太复杂，或者哪些变量包含有趣的状态不明显。在这种情况下，由于我们不知道足够小的相关状态值集，我们无法直接使用它们来指导fuzzer。相反，人类分析师可能能够识别代码中的位置，怀疑会改变状态。分析师可以使用这种状态变化的历史作为更复杂状态的抽象，并指导fuzzer。(状态机中不同状态难区分，难以探索状态变化的组合)

- **缺失中间状态**：与前两种情况不同，既没有包含状态的变量，也没有我们关心的改变状态的代码。在这种情况下，分析师可以创建人工中间状态来指导fuzzer。(哈希匹配、魔术字节等)

#### 反馈机制

- 四个通用原语，可以用于注释源代码：
    - 允许分析师选择哪些代码区域与解决手头问题相关。
    - 允许直接访问AFL位图以存储附加值。位图条目可以直接设置或递增，从而使状态值暴露给反馈函数。
    - 使分析师能够影响覆盖率计算。这允许相同的边覆盖产生不同的位图覆盖。这允许在不同状态下创建更细粒度的反馈。
    - 引入了一个允许用户添加爬坡优化的原语。这样，如果可能状态空间太大而无法详尽探索，用户可以提供一个工作目标。

- 具体实现：
    - IJON-Enable
    - IJON-INC and IJON-SET
    - IJON-STATE
### 问题

#### 问题1
> Before each new test run, the shared map is cleared. During the test run, each time an edge is encountered, the corresponding byte in the shared map is incremented. This implies that edge counts greater than 255 will overflow and might register as any number between 0 and 255. After the execution finished, the edge counts are bucketed such that each byte in the shared map with a non-zero edge count contains a power of 2. To this end, edge counts are discretized into the following ranges 1, 2, 3, 4 . . . 7, 8 . . . 15, 16 . . . 31, 32 . . . 127, 128 . . . 255. Each range of edge counts is assigned to one specific power of 2. To increase the precision on uncommon edges, 3 also maps to a unique power of 2, while the range 32 to 64 is omitted. Then we can compare the shared map against a global bitmap, which contains all bits that were previously observed in prior runs. If any new bit is set, the test input is stored because it has led to increased coverage, and the global bitmap is updated to contain the new coverage.

- 在每次新的测试运行之前，共享图被清除。在测试运行期间，每次遇到一个边，共享图中的相应字节就会增加。这意味着边计数大于255将溢出，并可能注册为0到255之间的任何数字。执行完成后，边计数被分桶，以便共享图中具有非零边计数的每个字节都包含2的幂。为此，边计数被离散化为以下范围1、2、3、4...7、8...15、16...31、32...127、128...255。每个边计数范围都分配给一个特定的2的幂。为了增加对不常见边的精度，3也映射到一个唯一的2的幂，而32到64的范围被省略。然后，我们可以将共享图与全局位图进行比较，全局位图包含以前运行中观察到的所有位。如果设置了任何新位，测试输入将被存储，因为它导致了覆盖率的增加，并且全局位图被更新以包含新的覆盖率。

**问题** ：这里AFL统计的频率有什么用？AFL为什么需要这个频率？用来做什么？

#### 问题2

> As another example, consider Listing 7. After each successfully parsed and handled message, we append the command index, which represents the type of the message, to the state change log. Then we set a single bit, addressed by the hash of the state change log. As a consequence, whenever we see a new combination of up to four successfully handled messages, the fuzzer considers the input as interesting, providing a much better coverage in the state space of the application.

- 例如，考虑代码。在每次成功解析和处理消息后，我们将命令索引（表示消息类型）附加到状态更改日志中。然后我们设置一个位，由状态更改日志的哈希地址。因此，每当我们看到最多四个成功处理的消息的新组合时，fuzzer将认为输入是有趣的，在应用程序的状态空间中提供更好的覆盖。

**问题**：这里从哪里可以看出是最多四个成功处理的消息的新组合就会认为有趣。

#### 问题3

**问题**：（源自前两天和同学的讨论）当时我身边同学认为可以逐个函数进行fuzzing，从而更精确的定位BUG位置，自底向上的对一个系统进行fuzzing。但是我当时感觉这样行不通，因为函数调用关系的存在，越是顶层的函数涉及的状态空间越大，其组合可能越多。可能也是我目前了解比较少，想了解一下目前领域内对一个程序的Fuzzing过程是如何进行的。

### 相关工作

#### AFL

- AFL发布后提出了不同的调度算法，以改进各种场景下的fuzzing。
- AFL的第二个组件是输入变异策略，对此也提出了各种改进。通过使用更多关于目标的信息或污点跟踪来限制需要变异的输入数据量，以增加生成有趣输入的概率。
- AFL观察每个测试用例的程序行为，并接收有关其行为的反馈。提出了不同的完全自动化技术，有助于改进这种反馈生成的性能，或者扩展反馈。
- 为了克服各种障碍，例如魔术字节，提出了基于共享执行和符号执行的技术。
- 由于fuzzing非常关键，其他项目优化了它的各个方面。
- 各种fuzzer使用Intel-PT来提高二进制目标的覆盖跟踪性能。
- 为了使fuzzing更具适用性，它被应用于从固件到超级用户到操作系统到神经网络的各种目标。

#### 人机协同 fuzzing

- 人机协同fuzzing 通常提供一个交互式环境，其中人类的交互被fuzzer用作种子。
- Shoshitaishvili等人引入了HACRS，这是一个允许人类通过模拟终端与目标应用程序交互的系统。HACRS分析目标并提供可能与应用程序行为相关的字符串列表，以帮助人类。当目标应用程序不以人类容易理解的格式消耗数据时，例如，二进制格式，或者程序输出不包含有关预期输入格式的有用信息时，HACRS无法工作。作者在评估中排除了提供示例场景中包含二进制字符的任何程序。
- DYNODROID跟踪人类与Android应用程序的交互，这包括更多样化的输入接口，如系统事件和滑动手势。
- 与HACRS和DYNODROID相比，IJON的方法是基于对目标应用程序的代码进行注释的，不需要理解输入格式。

#### IJON

- IJON几乎不需要对软件安全或程序分析有所了解，即使是未经训练的用户通常也可以赢得复杂的游戏。当对二进制文件格式或网络协议进行fuzzing时，即使是专家用户也很难根据仅观察程序输出来提出新的输入。
- IJON允许引导fuzzer生成输入以克服fuzzing障碍，并探索状态空间的更多多样化部分。这种方法根本不需要对输入格式有任何了解或理解。作者通常对目标应用程序的了解非常有限，因为他们的注释允许在没有对程序上下文的深入了解的情况下提供指导。

### 讨论与未来工作

- IJON提供了引导fuzzing过程的新方法，但它需要 **手动检查测试覆盖率** ，了解为什么约束难以解决，并手动创建一个合适的注释。这种手动工作对分析师来说是 **有一定成本** 的

- **找到好的种子输入** 也不是一件简单的事。**记录和重放机制** ，如HACRS或DYNODROID的一个版本适用于这个目标，可能会有所帮助，但在许多其他情况下，例如 **二进制格式** ，可能不会。

- IJON中使用的注释目前是手动添加的。**设计方法自动推断只针对困难的单个约束是有趣的**。一些现有的fuzzing方法使用我们描述的注释的子集。然而，所有这些工具都不加区别地使用额外的反馈。因此，它们受限于低信息增益反馈机制。

- 最后，现在，注释需要源访问。原则上，没有理由为仅二进制目标实现类似的注释。将IJON与仅二进制fuzzer集成将是有趣的。
