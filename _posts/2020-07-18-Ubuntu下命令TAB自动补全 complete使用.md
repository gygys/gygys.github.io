---
layout:     post
title:      Ubuntu下命令TAB自动补全 complete使用
subtitle:    ubuntu, bash, complete
date:       2020-07-18
author:     dulunar
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - Ubuntu
    - Bash TAB
---


## 前言

在Ubuntu的shell命令行中，当输入字符后，按两次`Tab`键，shell会列出一输入字符打头的所有可用命令，如果匹配的命令只有一个时，按一次`Tab`键就自动将该命令补齐。
除了命令补全之外，还有路径、文件名、目录名补全，比如使用`cd`切换到指定的目录和`ls`查看指定的文件的时候，都是比较好用的。

## 介绍
一般ubuntu的终端都会提供自动补全的功能，但是不同的终端略有不同，有些系统一装机就使用的是zsh，但是比较老一点的系统用的是bash，SHELL之间的切换可以使用下列命令：
```shell
chsh -s /bin/bash
chsh -s /bin/zsh

## 可以查看/bin下的SHELL类型，在切换到自己喜欢的
ls /bin/*sh
```

在这里主要介绍bash提供的补全功能。另外，当大家使用命令的时候，后面接参数，这个其实也可以进行补全，只要编辑好合适的补全脚本并存入到目录`/etc/bash_completion.d`下即可。

对于bash来说，使用的是内置的`complete`命令，用于支持`Tab`键的自动补全：
```shell
type -a complete
complete is a shell builtin
```

在Ubuntu中，系统会默认安装`bash-completion`包，其中包含了常用命令的大部分自动补齐脚本，如果想编写其他命令的补全脚本的时候，可以参考目录`/etc/bash_completion.d`下的文件的内容。

## samtools 补齐
作为生信用的比较多的一个软件之一，自动补齐是比较方便的一个操作，所以一般都会提前配置好，如下：
```shell
sudo vi /etc/bash_completion.d/samtools
# From https://raw.github.com/arq5x/bash_completion/master/samtools revision e931a8b46d9582672cc506e45ad9b4f4d6fbd743
_samtools()
{
  local cur prev opts
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  opts="dict faidx index calmd fixmate 
        reheader targetcut addreplacerg
        markdup collate cat merge mpileup 
        sort split quickcheck fastq fasta 
        bedcov depth flagstat idxstats 
        phase stats flags tview view depad"

  case $prev in
      samtools)
          COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
          ;;
  esac
  return 0
}
complete -F _samtools -o default samtools
```

添加完以后保存，执行一下`. /usr/share/bash-completion/bash_completion`，使修改生效；就可以进行测试了，输入`samtools vi`，在按`Tab`键，就会自动补齐成`samtools view`这样的命令，相对比较方便。

## git补齐
用的相对多的另外一个命令应该是`git`，先从`git github`上把配置好的文件下载下来：
```shell
wget https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash
sudo mv git-completion.bash /etc/bash_completion.d/
```

接下来在个人账号下面配置环境变量文件`~/.bashrc`，在其中添加如下语句，每次终端启动就会自动加载配置：
```shell
if [ -f /etc/bash_completion.d/git-completion.bash ]; then
        . /etc/bash_completion.d/git-completion.bash
fi
```

执行一次`. ~/.bashrc`，就可以测试git配置是否生效，`git cl`之后按`Tab`键，就会自动出来`git clone`，再在后面`git clone --`，再按`Tab`键，就会出现可选的参数等等。

## 其他程序
针对前面的samtools，我就依样画葫芦，添加了`bwa`和`sambamba`两个程序的complete补全脚本：
BWA 补全
```shell
sudo vi /etc/bash_completion.d/bwa
_bwa()
{
  local cur prev opts
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  opts="index aln samse sampe
        bwasw fastmap mem fa2pac pac2bwt
        pac2bwtgen bwtupdate
        bwt2sa"

  case $prev in
      bwa)
          COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
          ;;
  esac
  return 0
}
complete -F _bwa -o default bwa
```

sambamba补全
```shell
sudo vi /etc/bash_completion.d/sambamba
_sambamba()
{
    local cur=${COMP_WORDS[COMP_CWORD]}
    local subcommand=${COMP_WORDS[1]}

    if [[ $COMP_CWORD == 1 ]]; then
        COMPREPLY=( $(compgen -W "view index merge sort \
                                  flagstat slice markdup \
                                  depth mpileup validate \
                                  subsample" -- $cur) )
        compopt +o nospace
    elif [[ $cur == -* ]]; then
        case "$subcommand" in
            view)
              COMPREPLY=( $(compgen -W "-F -f -h -H -I -c -S -p \
                                        -l -o -t -s --filter= --header \
                                        --format= --with-header --count \
                                        --reference-info --show-progress \
                                        --sam-input --output-filename= \
                                        --nthreads= --compression-level= \
                                        --subsample= --subsampling-seed=" -- $cur) )
              ;;
            index)
              COMPREPLY=( $(compgen -W "-p -t --nthreads= --show-progress" -- $cur) )
              ;;
            merge)
              COMPREPLY=( $(compgen -W "-p -t --nthreads= -l -H --header \
                                        --compression-level=" -- $cur) )
              ;;
            sort)
              COMPREPLY=( $(compgen -W "-m --memory-limit= --tmpdir= -o --out \
                                        -n --compression-level= -u -p -t \
                                        --uncompressed-chunks --show-progress \
                                        --nthreads=" -- $cur) )
              ;;
            flagstat)
              COMPREPLY=( $(compgen -W "-t -p --nthreads= --show-progress" -- $cur) )
              ;;
            slice)
              COMPREPLY=( $(compgen -W "-o --output-filename=" -- $cur) )
              ;;
            markdup)
              COMPREPLY=( $(compgen -W "-r -t -l -p --tmpdir= --remove-duplicates \
                                        --nthreads= --compression-level= \
                                        --show-progress" -- $cur) )
              ;;
            subsample)
              COMPREPLY=( $(compgen -W "--type --max-cov -o --output -r --remove" -- $cur) )
              ;;
            depth)
              COMPREPLY=( $(compgen -W "-F -o -t -c -C -q -a -m -L -z -L -T -w -T --filter --output-file --nthreads --min-coverage --max-coverage --min-base-quality --annotate --fix-mate-overlaps --regions --report-zero-coverage --cov-threshold --window-size --cov-threshold" -- $cur) )
             ;;
            mpileup)
              COMPREPLY=( $(compgen -W "-L --regions -o --output-filename --tmpdir -t --nthreads -b --buffer-size -B --output-buffer-size" -- $cur) )
              ;;
        esac

        if [[ ${#COMPREPLY[@]} == 1 && ${COMPREPLY[0]} != "--"*"=" ]] ; then
            compopt +o nospace
        fi

    elif [[ ${COMP_WORDS[COMP_CWORD - 2]} == "--format" || ${COMP_WORDS[COMP_CWORD - 1]} == "-f" ]]; then
        COMPREPLY=( $(compgen -W "sam bam json msgpack" -- $cur) )
        compopt +o nospace
    elif [[ $subcommand == "view" || $subcommand == "slice" ]]; then
        for word in ${COMP_WORDS[@]}; do
            if [[ $word == *.bam && $word != "" ]]; then
                eval abspath=$word
                COMPREPLY=( $(sambamba view -H -t4 $abspath | grep @SQ | \
                              cut -f 2 | cut -f2 -d: 2>/dev/null | grep "^$cur") )
                break
            fi
        done

        if [[ ${#COMPREPLY[@]} == 0 ]]; then
            compopt +o nospace
        fi

        compopt -o default
        compopt -o filenames
    else
        compopt +o nospace
        compopt -o default
    fi
}

complete -o nospace -F _sambamba sambamba
```
在这里修改一下`~/.bashrc`文件，使得终端启动就可以使用这些自动补全：
```shell
vi ~/.bashrc
# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if [ -f /etc/bash_completion ] && ! shopt -oq posix; then
    . /etc/bash_completion
fi
```

重新source一下`~/.bashrc`以后就可以了加载更新的配置了。

## 常用命令
在上面的这写例子中，使用的是三个shell函数：`complete`、`compgen`和`compopt`，下面介绍一下这三个函数。

### complete
complete是补全命令中最核心的命令，指定如何对各个名称进行补全。列出一些常用的参数：
```shell
-F function	执行 shell 函数，函数中生成COMPREPLY作为候选的补全结果
-C command	将 command 命令的执行结果作为候选的补全 结果
-G pattern	将匹配 pattern的文件名作为候选的补全结果
-W wordlist	分割 wordlist 中的单词，作为候选的补全结果
-p [name]	  列出当前所有的补全命令
-r [name]	  删除某个补全命令
-D [name]   其后的选项和动作应用到默认补全，之前未定义的补全命令被补全
```
可以通过`-o`设置一些选项，常用的有：
```shell
bashdefault  如果没有生成补全条目，就使用bash默认的其它补全
default      如果没有生成补全条目，就使用“readline”默认的文件名补全
nospace      默认会自动填充一个空格，可以通过该参数关闭
filenames    在补全的时候会具体到文件，而不是目录，对于文件补齐比较有用
dirnames     如果没有生成补全条目，就进行目录名补全
noquote      告诉“readline”不引用文件名，默认会进行引用
plusdirs     生成补全条目之后，还会进行目录名补全并把结果添加到其它动作得到的结果中
```

部分例子：
```shell
$ complete -W 'com1 com2 com3 lunar' testm
$ testm<Tab>
com1   com2   com3   lunar
$ complete -p | grep testm
complete -W 'com1 com2 com3 lunar' testm
$ complete -r testm
$ complete -p | grep testm
```

### compgen
筛选命令，用来筛选生成匹配单词的候选补全结果，根据option生成与word可能匹配的补全：
```shell
compgen [option] [word]
## 单词匹配
$ compgen -W 'com1 com2 com3 lunar' -- c
com1
com2
com3
## 匹配当前路径下的文件名和目录名
$ compgen -f -- R
R
README.kegg
```

### compopt
compopt命令修改每个名称指定的补全选项，如果没有指定名称则修改当前执行的补全的选项，如果也没有指定选项，则显示每个名称或当前补全所用的选项。选项可能的取值就是上面的内建命令complete的有效选项。

```shell
compopt [-o option] [-DE] [+o option] [name]
+o option				启用 option 配置
-o option				弃用 option 配置
```

### 补全变量
在sambamba的补全脚本中，还使用了一些shell内置的补全变量，介绍一下：
```shell
COMP_WORDS 数组		存放当前命令行中输入的所有单词
COMP_CWORD 整数		当前输入的单词在 COMP_WORDS 中的索引
COMPREPLY  数组		候选的补全结果
COMP_LINE  字符串	当前的命令行输入字符
COMP_POINT 整数		光标在当前命令行的哪个位置
```

## GATK自动补全
GATK的Tool太多了，每次都不一定能很好的找到，在gatk的目录下面发现了一个好东西：
```shell
ls /home/luna/Desktop/Software/gatk/gatk-4.1.8.1/gatk-completion.sh
echo "source /home/luna/Desktop/Software/gatk/gatk-4.1.8.1/gatk-completion.sh" >> ~/.bashrc
```
稍微测试了一下，还是比较好用的，就是太卡了，应该是我服务器负载太高的原因，大家可以测试一下，虽然这个功能还是处于Beta阶段。

## 参考

[Linux Bash 自动补全][1]
[【Bash百宝箱】shell命令行自动补全（compgen、complete、compopt）][2]
[Linux Shell命令自动补全的实现][3]
[Bash Command-line Tab Completion][4]

[1]: https://jin-yang.github.io/post/linux-bash-auto-completion-introduce.html
[2]: https://blog.csdn.net/iEearth/article/details/52703598
[3]: https://cloud.tencent.com/developer/article/1555238
[4]: https://github.com/broadinstitute/gatk#tab_completion

									—— dulunar 后记于 2020.07

