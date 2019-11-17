---
layout:     post
title:      Perl中激活conda ENV
subtitle:    activate conda env
date:       2019-11-07
author:     dulunar
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Ubuntu
    - Perl
    - conda
---


## 前言
有时候在使用某些软件的时候，需要激活conda的环境，如果在搭建pipeline的时候，一般都是在程序内部进行activate env。在这里我用的是Perl搭建pipeline的。

## 错误的activate
### 直接在Perl中
刚开始想的比较简单，认为和以前一样，直接activate：
```perl
`conda activate hlaopti`;
```
但是不行，直接就报错了：
```shell
# Activate Conda Env hlaopti

CommandNotFoundError: Your shell has not been properly configured to use 'conda activate'.
To initialize your shell, run

    $ conda init <SHELL_NAME>

Currently supported shells are:
  - bash
  - fish
  - tcsh
  - xonsh
  - zsh
  - powershell

See 'conda init --help' for more information and options.

IMPORTANT: You may need to close and restart your shell after running 'conda init'.
```
这里表明没有进入conda的环境，设置有问题。

于是先使用source激活，再activate env：
```perl
`source /home/luna/Desktop/Software/miniconda3/bin/activate && conda activate hlaopti`;
```

接着报错：`sh: 1: source: not found`

### 编写sh脚本，调用
#### 直接activate不行，我就写了个sh脚本，用来在perl中调用：
```shell
vi hlaopti.sh
#!/bin/bash
#-----------------------------------------------------------------------------------
# FileName: hlaopti.sh
#-----------------------------------------------------------------------------------
conda activate hlaopti
```
接着在Perl中调用：
```perl
`. /home/luna/Desktop/Software/PIDsAnno/hlaopti.sh`;

# or
`source /home/luna/Desktop/Software/PIDsAnno/hlaopti.sh`;
# error: Can't exec "source": No such file or directory
```
出现错误：
```shell
sh: 5: /home/luna/Desktop/Software/miniconda3/etc/conda/activate.d/activate-binutils_linux-64.sh: Syntax error: "(" unexpected
```

#### 换一种方式调用：
```perl
`cd /home/luna/Desktop/Software/PIDsAnno && . hlaopti.sh`;

# or
`cd /home/luna/Desktop/Software/PIDsAnno && . ./hlaopti.sh`;
```
这里的错误：
```shell
sh: 1: .: hlaopti.sh: not found
```

## 正确的activate：
首先编写一个用于activate的shell脚本：
```shell
vi hlaopti.sh
#!/bin/bash
#-----------------------------------------------------------------------------------
# FileName: hlaopti.sh
#-----------------------------------------------------------------------------------

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/home/luna/Desktop/Software/miniconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/luna/Desktop/Software/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/home/luna/Desktop/Software/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/home/luna/Desktop/Software/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

conda activate hlaopti
```

保存后，接着在Perl中调用这个shell脚本：
```perl
`bash -i /home/luna/Desktop/Software/PIDsAnno/hlaopti.sh`;

# or
system "bash", "/home/luna/Desktop/Software/PIDsAnno/hlaopti.sh";

# or
`chmod +x /home/luna/Desktop/Software/PIDsAnno/hlaopti.sh`;
`/home/luna/Desktop/Software/PIDsAnno/hlaopti.sh`;
```

在`bash`等`shell`中，`source`是一个内置的函数，其意义在于读取文件并在本地解释这个文件，有点类似于`c`中的 `#include`;

在现在的情况下面，`source`没有任何意义，应该在脚本首行标注一下`shebang`:`#!`，告诉系统使用哪一个 `shell`来执行这个脚本，或者直接告诉系统用的是什么：`bash *****.sh`;


## 参考
[Conda activate not working][1]

[How to run “source” command (Linux) from a perl script][2]

[1]: https://stackoverflow.com/questions/47246350/conda-activate-not-working
[2]: https://stackoverflow.com/questions/33781557/how-to-run-source-command-linux-from-a-perl-script

									—— dulunar 后记于 2019.11
