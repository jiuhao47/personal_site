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

#### Approaches to State Exploration


> Known Relevant State Values: As described before, sometimes the code coverage yields nearly no information about the state of the program, because all the interesting state is stored in data. For example, the coverage tells very little about the behavior of a branch-free AES implementation. If the analyst has an understanding of the variables that store the interesting state, he can directly expose the state to the fuzzer and the fuzzer is then able to explore inputs that cause different internal states.

- 已知相关状态值：如前所述，有时代码覆盖几乎不提供关于程序状态的信息，因为所有有趣的状态都存储在数据中。例如，覆盖几乎不提供关于无分支AES实现行为的信息。如果分析师了解存储有趣状态的变量，他可以直接将状态暴露给fuzzer，然后fuzzer就能够探索导致不同内部状态的输入。

```c
while (true) {
  ox = x;
  oy = y;
  switch (input[i]) {
  case 'w':
    y--;
    break;
  case 's':
    y++;
    break;
  case 'a':
    x--;
    break;
  case 'd':
    x++;
    break;
  }
  if (maze[y][x] == '#') {
    Bug();
  }
  // If target is blocked, do not advance
  if (maze[y][x] != ' ') {
    x = ox;
    y = oy;
  }
}
```

> Consider the code. It implements a small game, in which the player has to navigate a labyrinth by moving in one of four possible directions. It is based on the famous labyrinth demo that is commonly used by the symbolic execution community to demonstrate how a symbolic executor can explore the state space of a maze. In this modified version, it is possible to walk backward and to stay in the same place. This creates a vast amount of different paths through the program. At the same time, there are effectively only four branches that can be covered, thus the coverage alone is not a good indicator of interesting behavior. In this harder version, even KLEE fails to solve the labyrinth. Here, it is essential to understand that the x and y coordinates are relevant states that need to be explored. In mazes with dead ends, it is even impossible to find a solution by trying to increase x or y individually. The combination of both x and y has to be considered to uncover a solution. Since the maze is rather small (at most only a few hundred different x, y pairs are reachable), the analyst can instruct the fuzzer to consider any new pair as new coverage.

- 考虑代码。它实现了一个小游戏，玩家必须通过在四个可能的方向中移动来导航迷宫。它基于著名的迷宫演示，通常被符号执行社区用来演示符号执行器如何探索迷宫的状态空间。在这个修改后的版本中，可以向后走，也可以停留在原地。这通过程序创建了大量不同的路径。同时，**实际上只有四个分支可以被覆盖，因此仅仅覆盖不是有趣行为的好指标**。在这个更难的版本中，即使是KLEE也无法解决迷宫。在这里，重要的是要理解x和y坐标是需要探索的相关状态。在有死胡同的迷宫中，通过尝试单独增加x或y是不可能找到解决方案的。必须考虑x和y的组合才能找到解决方案。**由于迷宫相当小（最多只有几百个不同的x，y对是可达的），分析师可以指示fuzzer将任何新对视为新覆盖**。

> Known State Changes: In some scenarios, the user might not be aware of which parts of the relevant state are interesting to explore or the state might be spread out across the application and hard to identify. Alternatively, the state might be known, but no sufficiently small subset can be identified to be used to guide the fuzzer directly. However, it might be possible to identify parts of the code that are expected to change the state. This situation commonly occurs in applications that consume highly structured data such as sequences of messages or lists of chunks in file formats. In such situations, instead of directly exposing the state itself, the user can create a variable that contains a log of messages or chunk types. This variable can act as a proxy for the actual state changes and can be exposed to the feedback function (Figure 2.b). As a consequence, the fuzzer can now try to explore different combinations of those state changes. In such scenarios, the state change log serves as an abstraction layer to the real state that cannot easily be exposed to the fuzzer. We further elaborate on this in Example 4 of Section III-D.

- 已知状态变化：在某些情况下，用户可能不知道哪些相关状态的部分是有趣的探索，或者状态可能分散在整个应用程序中，很难识别。或者，状态可能是已知的，但无法识别足够小的子集来直接指导fuzzer。但是，可能可以识别预计会改变状态的代码部分。这种情况通常发生在消耗高度结构化数据的应用程序中，例如消息序列或文件格式中的块列表。 **在这种情况下，用户可以创建一个包含消息或块类型日志的变量。这个变量可以作为实际状态变化的代理，并暴露给反馈函数。因此，fuzzer现在可以尝试探索这些状态变化的不同组合** 。在这种情况下，状态变化日志充当了一个抽象层，用于无法轻松暴露给fuzzer的真实状态。

```c
msg = parse_msg();
switch (msg.type) {
case Hello:
  eval_hello(msg);
  break;
case Login:
  eval_login(msg);
  break;
case Msg_A:
  eval_msg_a(msg);
  break;
}
```

> Consider the dispatcher code shown in Listing 2, which is based on many common protocol implementations. The fuzzer will successfully uncover the different messages. However, AFL has difficulties to generate interesting sequences of messages, as no novel coverage is produced for chaining messages. The fundamental problem here is that the fuzzer is not able to distinguish between different states in the program state machine. By using a log of the types of messages that were successfully processed, the fuzzer is able to explore different states, resulting from combinations of messages, much more effectively.

- 考虑代码中显示的调度程序代码，它基于许多常见的协议实现。fuzzer将成功地发现不同的消息。然而，AFL难以生成有趣的消息序列，因为没有为链接消息生成新的覆盖。这里的根本问题是fuzzer无法区分程序状态机中的不同状态。通过使用成功处理的消息类型的日志，fuzzer能够更有效地探索由消息组合产生的不同状态。

<!--TODO: What's The problem Here -->

> Missing Intermediate State: A simple example for issues where neither coverage nor values in the program provide relevant feedback are magic byte checks. Out of the box, AFLstyle fuzzers will not be able to solve them. Note that various approaches try to solve this case using additional methods. However, the same problem persists in more complex cases: if the relationship between the input and the final comparison gets more complex, even techniques like concolic execution will fail. A human analyst on the other hand, can usually reason about how the program behaves and can often provide an indicator of progress. By encoding this indicator as additional artificial intermediate states, the analyst is able to guide the fuzzer. Note that for simple magic bytes like situations, this is exactly what LAF-INTEL does.

- 缺失中间状态：既不涉及覆盖率也不涉及值的反馈的问题的一个简单例子是魔术字节检查。在开箱即用的情况下，AFL风格的fuzzer将无法解决这个问题。请注意，各种方法尝试使用其他方法解决这个问题。然而，在更复杂的情况下，同样的问题仍然存在：如果输入和最终比较之间的关系变得更加复杂，即使是共享执行这样的技术也会失败。另一方面，人类分析师通常可以推理程序的行为，并经常提供进展的指示。通过将这个指示符编码为额外的人工中间状态，分析师能够指导fuzzer。请注意，对于简单的魔术字节情况，这正是LAF-INTEL所做的。

```c
// shortened version of a hashmap lookup from binutils
entry *bfd_get_section_by_name(table *tbl, char *str) {
  entry *lp;
  uint32_t hash = bfd_hash_hash(str);
  uint32_t i = hash % tbl->size;
  // Every hash bucket contains a linked list of strings
  for (lp = tbl->table[i]; lp != NULL; lp = lp->next) {
    if (lp->hash == hash && strcmp(lp->string, str) == 0)
      return lp;
  }
  return NULL;
}
// used somewhere else
section = bfd_get_section_by_name(abfd, ".bootloader");
if (section != NULL) {
  ...
}
```

> Consider the code in Listing 3, which is based on a hard case found in the well-known objdump binary. The program contains a function that performs a hash table lookup and one if condition where the lookup result is used to search for a given string. More specifically, the key is first hashed, and the corresponding bucket is checked. If the bucket is empty, no further processing takes place. If the bucket contains some values, they are compared individually. This poses a significant challenge both to a concolic execution based tools as well as fuzzers: solving this constraint requires to find a very specific combination of both a path (i.e., number of loop iterations necessary to calculate the hash) and the hash value that all share the same coverage. Even if the exact path is found, we now still depend on both the hash and the actual string matching. The fuzzer has to solve the comparison while maintaining that the hash of the input is always equal to the hash of the target string. A concolic executor would have great trouble finding the exact path to solve this constraint.

- 考虑代码，它基于著名的objdump二进制文件中的一个难题。程序包含一个执行哈希表查找的函数和一个if条件，其中查找结果用于搜索给定的字符串。更具体地说，首先对密钥进行哈希处理，然后检查相应的桶。如果桶为空，则不进行进一步处理。如果桶包含一些值，则逐个进行比较。这对基于共享执行的工具和fuzzer都构成了重大挑战：解决这个约束需要找到一个非常特定的组合，即路径（即，计算哈希所需的循环迭代次数）和所有共享相同覆盖的哈希值。即使找到了确切的路径，我们现在仍然依赖于哈希和实际字符串匹配。fuzzer必须在保持输入的哈希始终等于目标字符串的哈希的情况下解决比较。共享执行器将很难找到解决这个约束的确切路径。

> We found that similar conditions occur more than 500 times with various strings throughout the binutils code base. In most cases, the hash table is filled with values from the input, and a fixed string is looked up. A human can recognize that this effectively implements a one-to-many string comparison. Using this insight, she can guide the fuzzer to find a solution, by turning this complex constraint into a series of simple string comparisons that can be solved with LAF-INTEL-like feedback.

- 我们发现类似的条件在整个binutils代码库中多达500多次，使用各种字符串。在大多数情况下，哈希表填充了来自输入的值，并查找了一个固定的字符串。人类可以认识到，这实际上实现了一对多的字符串比较。利用这一见解，她可以指导fuzzer找到解决方案，将这个复杂的约束转化为一系列简单的字符串比较，可以使用类似LAF-INTEL的反馈来解决。

### Feedback Mechanisms

> As no current fuzzer allows a human analyst to directly provide feedback to the fuzzer, we design a set of annotations that allow the analyst to influence the fuzzer’s feedback function. Our goal is that an analyst can use these annotations to provide high-level steering for the fuzzing process. In an interactive fuzzing session, the analyst inspects the code coverage from time to time to identify branches that seem hard to cover for the fuzzer. Then the analyst can identify the reason why the fuzzer is unable to make progress. Typically, this is an easy task for a human. When the road block is found, the analyst can start a second fuzzing session that focuses on solving this road block using a custom annotation. The annotation itself is a small patch to the target application, typically consisting of one, sometimes two lines of code that provide additional feedback information. When the fuzzer solves the road block, the long-running fuzzing session picks the inputs that produce new coverage from the temporary session and continues fuzzing, hence overcoming the hard case.

- 由于没有当前的fuzzer允许人类分析师直接向fuzzer提供反馈，我们设计了一组注释，允许分析师影响fuzzer的反馈函数。我们的目标是，分析师可以使用这些注释为fuzzing过程提供高级别的引导。在交互式fuzzing会话中，分析师不时检查代码覆盖率，以识别对fuzzer来说似乎很难覆盖的分支。然后，分析师可以确定fuzzer无法取得进展的原因。通常，这对人类来说是一项容易的任务。当找到路障时，分析师可以启动第二个fuzzing会话，重点解决这个路障，使用自定义注释。注释本身是对目标应用程序的一个小补丁，通常包含一行，有时包含两行代码，提供额外的反馈信息。当fuzzer解决了路障时，长时间运行的fuzzing会话从临时会话中选择产生新覆盖的输入，并继续fuzzing，从而克服困难情况。

> To facilitate a workflow like this, we designed four general primitives that can be used to annotate source code:

> 1) We allow the analyst to select which code regions are relevant to solve the problem at hand.

> 2) We allow direct access to the AFL bitmap to store additional values. Bitmap entries can either be directly set or incremented, hence enabling to expose state values to the feedback function.

> 3) We enable the analyst to influence the coverage calculation. This allows the same edge coverage to result in different bitmap coverage. This allows to create much more fine-grained feedback in different states.

> 4) We introduce a primitive that allows the user to add hill climbing optimization [48]. This way, the user can provide a goal to work towards if the space of possible states is too large to explore exhaustively. 


- 为了促进这样的工作流程，我们设计了四个通用原语，可以用于注释源代码：
    - 我们允许分析师选择哪些代码区域与解决手头问题相关。
    - 我们允许直接访问AFL位图以存储附加值。位图条目可以直接设置或递增，从而使状态值暴露给反馈函数。
    - 我们使分析师能够影响覆盖率计算。这允许相同的边覆盖产生不同的位图覆盖。这允许在不同状态下创建更细粒度的反馈。
    - 我们引入了一个允许用户添加爬坡优化的原语。这样，如果可能状态空间太大而无法详尽探索，用户可以提供一个工作目标。

### Annotations

- IJON-Enable: 

    > The IJON-ENABLE (and IJON-DISABLE) annotation can be used to enable and disable coverage feedback. This way, we can effectively exclude certain parts of the code base or guide the fuzzer to only explore code if certain conditions are met.

    - IJON-ENABLE（和IJON-DISABLE）注释可用于启用和禁用覆盖反馈。这样，我们可以有效地排除代码库的某些部分，或者指导fuzzer只在满足某些条件时探索代码。

- IJON-INC and IJON-SET

    > The IJON-INC and IJON-SET annotations can be used to increment or set a specific entry in the bitmap. This effectively allows new values in the state to be considered as equal to new code coverage. The analyst can use this annotation to expose aspects of the state to the fuzzer selectively. As a result, the fuzzer can then explore many different values of this variable. Effectively, this annotation adds a feedback mechanism beyond code coverage. The fuzzer is now also rewarded for new data coverage obtained via its test cases. This annotation can be used to provide feedback in all three scenarios that we described earlier.
    
    - IJON-INC和IJON-SET注释可用于递增或设置位图中的特定条目。这实际上允许将状态中的新值视为新的代码覆盖。分析师可以使用此注释有选择地将状态的方面暴露给fuzzer。结果，fuzzer现在可以探索这个变量的许多不同值。实际上，这个注释添加了一个超出代码覆盖的反馈机制。现在，fuzzer还将通过其测试用例获得的新数据覆盖奖励。此注释可用于提供我们早期描述的所有三种情况的反馈。 


    > As another example, consider Listing 7. After each successfully parsed and handled message, we append the command index, which represents the type of the message, to the state change log. Then we set a single bit, addressed by the hash of the state change log. As a consequence, whenever we see a new combination of up to four successfully handled messages, the fuzzer considers the input as interesting, providing a much better coverage in the state space of the application.
    
    - 例如，考虑代码。在每次成功解析和处理消息后，我们将命令索引（表示消息类型）附加到状态更改日志中。然后我们设置一个位，由状态更改日志的哈希地址。因此，每当我们看到最多四个成功处理的消息的新组合时，fuzzer将认为输入是有趣的，在应用程序的状态空间中提供更好的覆盖。

<!-- TODO: Why Four?-->

- IJON-STATE

    > If the messages cannot easily be concatenated (e.g., because there is a message counter), the state change log might be insufficient to explore different states. To produce a more finegrained feedback, we can explore the Cartesian product of the state and the code coverage. To enable this, we provide a third primitive that is able to change the computation of the edge coverage itself. Similar to ANGORA, we extended the edge tuple with a third component named the “virtual state”. This virtual state component is also considered when calculating the bitmap index of any edge. This annotation is called IJON-STATE. Whenever the virtual state changes, any edge triggers new coverage. This primitive has to be used carefully: if the number of virtual states grows too large, the fuzzer is overwhelmed with a large number of inputs which effectively slows down the fuzzing progress.

    - 如果消息不能轻松连接（例如，因为有一个消息计数器），状态更改日志可能不足以探索不同的状态。为了产生更细粒度的反馈，我们可以探索状态和代码覆盖的笛卡尔积。为了实现这一点，我们提供了一个能够改变边覆盖计算本身的第三个原语。类似于ANGORA，我们扩展了边元组，增加了一个名为“虚拟状态”的第三个组件。在计算任何边的位图索引时，也考虑这个虚拟状态组件。这个注释称为IJON-STATE。每当虚拟状态发生变化时，任何边都会触发新的覆盖。这个原语必须小心使用：如果虚拟状态的数量增长得太大，fuzzer将被大量输入所淹没，这实际上会减慢fuzzing的进度。

- IJON-MAX

    > So far, we mostly dealt with providing feedback that can be used to increase the diversity of the inputs stored. In some cases, however, we want to optimize towards a specific goal or the state space is simply too large to cover completely. In such cases, we might not care about a diverse set of values or want to discard all intermediate values. To allow effective fuzzing in such cases, we provide a maximization primitive called IJON-MAX. It effectively turns the fuzzer into a generic hill climbing-based black box optimizer. To enable maximizing more than one value, multiple (by default 512) slots are provided to store those values. Like the coverage bitmap, each value is maximized independently. Using this primitive, it is also possible to easily build a minimization primitive for x, by maximizing −x.

    - 到目前为止，我们主要处理提供反馈，可以用来增加存储的输入的多样性。然而，在某些情况下，我们想要优化到一个特定的目标，或者状态空间太大，无法完全覆盖。在这种情况下，我们可能不关心多样化的值，或者想要丢弃所有中间值。为了在这种情况下实现有效的fuzzing，我们提供了一个称为IJON-MAX的最大化原语。它有效地将fuzzer转变为一个基于黑盒优化器的通用爬坡算法。为了使多个值最大化，提供了多个（默认为512）插槽来存储这些值。像覆盖位图一样，每个值都是独立最大化的。使用这个原语，还可以轻松地构建一个x的最小化原语，通过最大化-x。
    
    > Consider the video game Super Mario Bros., in which a player controls a character in a side-scrolling game. In each level, the objective is to reach the end of the level, while avoiding hazards such as enemies, traps, and pits. In case the character is touched by an enemy or falls into a pit, the game ends. To properly explore the state space of the game, it is important to reach the end of each level. As illustrated in Listing 9, we can finish the level by asking the fuzzer to try to maximize the player’s x coordinate. Given that it is a side-scrolling game, this effectively guides the fuzzer to find a way through the level to successfully finish it

    - 考虑视频游戏超级马里奥兄弟，其中玩家控制一个角色在一个横向滚动的游戏中。在每个级别中，目标是到达级别的末尾，同时避开敌人、陷阱和坑洞等危险。如果角色被敌人碰到或掉进坑里，游戏就会结束。为了正确探索游戏的状态空间，重要的是到达每个级别的末尾。如代码所示，我们可以通过要求fuzzer尝试最大化玩家的x坐标来完成级别。鉴于这是一个横向滚动的游戏，这实际上引导fuzzer找到一种通过级别的方法，成功完成它。

## IJON 的实现

## IJON 的评估

## 相关工作

> After AFL was published about five years ago, its inner workings were analyzed in detail and multiple improvements were proposed. Different scheduling algorithms were proposed to improve fuzzing in various scenarios [10], [11], [13], [46], [56]. The second component of AFL is the input mutation strategy. Again, various improvements were proposed to increase the probability of generating interesting inputs by means of using more information on the target [6], [7], [9], [27], [40], [44] or taint tracking to limit the amount of input data that needs to be mutated [14], [45]. Lastly, AFL observes the programs behavior for each test case and receives feedback on its behavior. Different fully automated techniques were proposed that help improving the performance of this feedback generation [19], [50] or to extend the feedback [1], [29], [32]. To overcome various roadblocks, such as magic bytes, techniques based on concolic execution [20]–[22], [26], [37], [53], [55], [60], [63] and—less commonly—on symbolic execution [16], [38] were proposed. Since fuzzing is very performance-critical, various aspects of it were optimized by other projects. For example, Xu et al. improved the performance of spawning subprocesses [58]. Various fuzzers used Intel-PT to increase the performance of coverage tracing on binary targets [5], [50]. Lastly, to make fuzzing more applicable it was adopted to targets ranging from firmware [16], [64] over hypervisors [28] and operating systems [4], [50], [54] to neural networks [42], [57]


- 在大约五年前发布AFL之后，其内部工作原理被详细分析，并提出了多种改进。提出了不同的调度算法，以改进各种场景下的fuzzing。AFL的第二个组件是输入变异策略。同样，提出了各种改进，通过使用更多关于目标的信息或污点跟踪来限制需要变异的输入数据量，以增加生成有趣输入的概率。最后，AFL观察每个测试用例的程序行为，并接收有关其行为的反馈。提出了不同的完全自动化技术，有助于改进这种反馈生成的性能，或者扩展反馈。为了克服各种障碍，例如魔术字节，提出了基于共享执行和符号执行的技术。由于fuzzing非常关键，其他项目优化了它的各个方面。例如，Xu等人改进了生成子进程的性能。各种fuzzer使用Intel-PT来提高二进制目标的覆盖跟踪性能。最后，为了使fuzzing更具适用性，它被应用于从固件到超级用户到操作系统到神经网络的各种目标。

> Recently, human-in-the-loop fuzzing gained the attention of the research community. Current approaches commonly provide an interactive environment where the humans interactions are used as seeds by the fuzzer. In some scenarios this is very helpful, while in other common fuzzing scenarios, it is very hard to apply. For example, Shoshitaishvili et al. [52] introduced HACRS, a system that allows humans to interact with the target application via an emulated terminal. To help the human, HACRS analyzes the target and provides a list of strings that might be relevant to the application’s behavior. If the target provides a text-based interface, a human is often able to figure out how to interact with the target application. However, HACRS does not work when the target application does not consume data in a format easily understood by humans, e.g., binary formats, or the program output does not contain helpful information on the expected input format. Consequently, the authors excluded any program containing binary characters in the provided example scenarios from their evaluation. Similarly, DYNODROID [36] traces a human’s interaction with Android applications. In contrast to HACRS, this includes a more diverse set of input interfaces such as system events and swipe gestures. However, the fundamental principle remains the same. In contrast, our approach is based on annotating the code of the target application and does not require to understand the input format.

- 最近，人机协同fuzzing引起了研究界的关注。当前的方法通常提供一个交互式环境，其中人类的交互被fuzzer用作种子。在某些情况下，这是非常有帮助的，而在其他常见的fuzzing场景中，这是非常难以应用的。例如，Shoshitaishvili等人引入了HACRS，这是一个允许人类通过模拟终端与目标应用程序交互的系统。为了帮助人类，HACRS分析目标并提供可能与应用程序行为相关的字符串列表。如果目标提供基于文本的接口，人类通常能够弄清楚如何与目标应用程序交互。然而，当目标应用程序不以人类容易理解的格式消耗数据时，例如，二进制格式，或者程序输出不包含有关预期输入格式的有用信息时，HACRS无法工作。因此，作者在评估中排除了提供示例场景中包含二进制字符的任何程序。类似地，DYNODROID跟踪人类与Android应用程序的交互。与HACRS相比，这包括更多样化的输入接口，如系统事件和滑动手势。然而，基本原则保持不变。相比之下，我们的方法是基于对目标应用程序的代码进行注释的，不需要理解输入格式。

> Our approach requires little understanding of software security or program analysis. Even complex games can typically be won by untrained users. On the other hand, when fuzzing binary file formats or network protocols, even an expert user will have a hard time to come up with novel inputs based on observing only the program output. IJON allows to guide the fuzzer’s intrinsic ability to generate inputs to overcome fuzzing roadblocks and to explore a more diverse part of the state space. This approach requires no knowledge or understanding of the input format at all. In fact, we also typically had very limited understanding of the target application, as our annotations allow to provide guidance without deep understanding of the program context. For example, consider the bug shown in Listing 12. The annotation was added without any context or understanding of how kolyblk.XMLLength is calculated from the input. Still, IJON was able to trigger the integer overflow after a few minutes of analysis time.

- 我们的方法几乎不需要对软件安全或程序分析有所了解。即使是未经训练的用户通常也可以赢得复杂的游戏。另一方面，当对二进制文件格式或网络协议进行fuzzing时，即使是专家用户也很难根据仅观察程序输出来提出新的输入。IJON允许引导fuzzer生成输入以克服fuzzing障碍，并探索状态空间的更多多样化部分。这种方法根本不需要对输入格式有任何了解或理解。事实上，我们通常对目标应用程序的了解非常有限，因为我们的注释允许在没有对程序上下文的深入了解的情况下提供指导。例如，考虑代码中显示的错误。注释是在没有任何上下文或对kolyblk.XMLLength如何从输入计算的理解的情况下添加的。尽管如此，IJON能够在几分钟的分析时间后触发整数溢出。

## 讨论与未来工作

> In this paper we describe an interactive approach to fuzzing. While this offers new ways to steer the fuzzing process, it requires manual inspection of the test coverage, acquiring an understanding of why a constraint is hard to solve, and manually creating a well-suited annotation. This manual effort comes with a certain cost to the analyst, but our evaluation demonstrates that this approach can overcome several obstacles for current fuzzers. For example, it is clear that neither a grammar nor a dictionary will help a fuzzer to solve Super Mario levels. Additionally, it is not straightforward to find good seed inputs. While in such a case, a record and replay mechanism such as a version of HACRS or DYNODROID applicable to this target might be helpful, in many other cases
such as binary formats, it would likely not. 

- 在本文中，我们描述了一种交互式fuzzing方法。虽然这提供了引导fuzzing过程的新方法，但它需要 **手动检查测试覆盖率** ，了解为什么约束难以解决，并手动创建一个合适的注释。这种手动工作对分析师来说是有一定成本的，但我们的评估表明，这种方法可以克服当前fuzzer的几个障碍。例如，很明显，语法和字典都无法帮助fuzzer解决超级马里奥的关卡。此外，要找到好的种子输入也不是一件简单的事。在这种情况下，记录和重放机制，如HACRS或DYNODROID的一个版本适用于这个目标，可能会有所帮助，但在许多其他情况下，例如二进制格式，可能不会。

> The annotations used in IJON are currently added manually. It would be interesting to design methods that automatically infer annotations only for difficult individual constraints. Some existing fuzzing approaches use a subset of the annotations described by us. For example, LAF-INTEL can be represented by annotating the number of equal bytes in a comparison. Similarly, ANGORA already implements call stack based virtual state for all coverage. However, all those tools use additional feedback indiscriminately. Therefore, they are limited to low information gain feedback mechanisms. Using more precise feedback in a similar manner would result in a much larger queue and decreased performance. Automated techniques to identify IJON annotations could make use of much more powerful annotations than LAF-INTEL and ANGORA, as they are applied sparsely. Finally, right now, the annotations require source access. In principle, there is no reason why similar annotations cannot be implemented for binary-only targets. Integrating IJON with a binary-only fuzzer would be interesting 

- IJON中使用的注释目前是手动添加的。设计方法自动推断只针对困难的单个约束。一些现有的fuzzing方法使用我们描述的注释的子集。例如，LAF-INTEL可以通过注释比较中相等字节的数量来表示。类似地，ANGORA已经为所有覆盖实现了基于调用堆栈的虚拟状态。然而，所有这些工具都不加区别地使用额外的反馈。因此，它们受限于低信息增益反馈机制。以类似的方式使用更精确的反馈将导致一个更大的队列和性能降低。自动识别IJON注释的技术可以利用比LAF-INTEL和ANGORA更强大的注释，因为它们应用得很少。最后，现在，注释需要源访问。原则上，没有理由为仅二进制目标实现类似的注释。将IJON与仅二进制fuzzer集成将是有趣的。

## 结论

> In this paper, we have shown that a large number of hard problems for fuzzers can be solved by manually inspecting the code coverage during fuzzing and using only a few lines of annotations to guide the fuzzing process. Previously, practitioners in the industry often used to manually pick seed files that solve the coverage or to design custom mutators that solve constraints (for example, by providing dictionaries or grammars). Similarly, it is well documented that practitioners try to remove hard constraints such as checksum manually. We extended this toolkit with another manual but very flexible method: annotations that an analyst can use to guide the fuzzer. By using less than four lines of code, we demonstrated how a large set of problems could be solved that no other automated fuzzing approach is currently able to handle.

- 在本文中，我们展示了fuzzer的大量难题可以通过在fuzzing过程中手动检查代码覆盖率，并使用几行注释来引导fuzzing过程来解决。以前，工业界的从业者经常手动选择解决覆盖率的种子文件，或者设计自定义变异器来解决约束（例如，通过提供字典或语法）。同样，有充分的文档证明，从业者尝试手动删除硬约束，例如校验和。我们扩展了这个工具包，增加了另一种手动但非常灵活的方法：分析师可以使用注释来引导fuzzer。通过使用不到四行代码，我们演示了如何解决一系列问题，目前没有其他自动fuzzing方法能够处理。

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

<!-- TODO: AFL统计的频率有什么用？从IJON_SET设置最低有效位图位引发的思考-->

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

### Branch-free AES Implementations

> For example, the coverage tells very little about the behavior of a branch-free AES implementation.

- 例如，覆盖几乎不提供关于无分支AES实现行为的信息。

"Branch-free AES implementation"是指一种避免在代码中使用条件分支（例如`if`语句）的高级加密标准（AES）算法的实现。这种方法通常用于提高性能和安全性，特别是在密码学应用中。

#### 主要特点

- **性能**：通过消除分支，实现可以在现代处理器上实现更好的性能，因为它减少了管道停滞的风险并提高了指令级并行性。

- **安全性**：无分支实现可以缓解某些侧信道攻击，例如利用由条件分支引起的执行时间变化的定时攻击。

#### 实现技术

- **查找表**：使用预计算的表来替换条件逻辑。例如，实现可以使用查找表直接访问所需的值，而不是检查条件以确定要执行哪种操作。

- **位操作**：利用位操作进行必要的计算，而无需分支。

### ANGORA

> Angora is a mutation-based coverage guided fuzzer. The main goal of Angora is to increase branch coverage by solving path constraints without symbolic execution.

- Angora是一种基于变异的覆盖引导fuzzer。Angora的主要目标是通过解决路径约束而不使用符号执行来增加分支覆盖。

## 有趣的话

> Computers are incredibly fast, accurate and stupid; humans are incredibly slow, inaccurate and brilliant; together they are powerful beyond imagination

- 计算机非常快速、准确和愚蠢；人类非常缓慢、不准确和聪明；在一起，他们的力量超乎想象。

> Since even for trivially small programs, the state space is larger than the number of atoms in the universe, the fuzzer has to optimize the diversity of states reached by the test cases.

- 由于即使对于微不足道的小程序，状态空间也比宇宙中的原子数量还要大，因此fuzzer必须优化测试用例达到的状态的多样性。

> Glitches: Super Mario Bros. contains various wellknown glitches and secret passages, commonly exploited by speed-runners. Our fuzzer was able to find and exploit at least two of those. 

- 毛刺：超级马里奥兄弟包含各种众所周知的毛刺和秘密通道，通常被速通玩家利用。我们的fuzzer能够找到并利用其中至少两个。
