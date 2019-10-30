---
layout:     post
title:      fastq-dump并行版软件的使用
subtitle:    并行版fastq-dump
date:       2019-10-30
author:     dulunar
header-img: img/post-bg-2015.jpg
catalog: true
tags:
    - 生信软件
    - SRA
---


## 前言
> “🙉🙉🙉 ”

fastq-dump转换SRA文件到fastq文件很慢，因为这个程序只能单线程运行，在这个多核的时代，并行版本成为趋势；

但是无论怎么更新，先要打好基础，使用并行版本的前提一定要保证NCBI的fastq-dump可以在服务器上正常运行。

<p id = "build"></p>
---

## 正文

#### 首先安装Sratoolkit的最新版(v.2.9.2)：
```shell
mkdir -p /path-to-Sratoolkit/ && cd /path-to-Sratoolkit/
wget  https://ftp-trace.ncbi.nlm.nih.gov/sra/sdk/2.9.2/sratoolkit.2.9.2-ubuntu64.tar.gz 
tar zxfv sratoolkit.2.9.2-ubuntu64.tar.gz
mv sratoolkit.2.9.2-ubuntu64/* . 
rm -rf sratoolkit.2.9.2-ubuntu64.tar.gz sratoolkit.2.9.2-ubuntu64
```

#### 下载pfastq-dump：
```shell
git clone https://github.com/inutano/pfastq-dump 
cd pfastq-dump 
chmod a+x bin/pfastq-dump 
ln -s bin/pfastq-dump  /path-to-Sratoolkit/bin
```

#### 把安装的路径加入到账号下的$PATH中：
```shell
echo 'PATH=/home/luna/Desktop/Software/Sratoolkit/bin:$PATH' >> ~/.bashrc
cp ~/.bashrc ~/.bash_profile 
source ~/.bashrc ~/.bash_profile
```

a. 使用pfastq_dump，因为pfastq_dump是基于fastq_dump写的一个bash程序，所以参数是相同的:

1. 对于单端数据转换，转换后文件是fq.gz：
```shell
for id in *sra;    do pfastq-dump --threads 10 ./$id --gzip;    done 
```

2. 对于双端数据转换，转换后文件是fq.gz：
```shell
for id in *sra;        do pfastq-dump  --threads 8 ./$id --split-3 --gzip;    done 
```

b. 直接用sra号下载并解压fastq文件，但是推荐下载好文件再使用fastq_dump转换，且文件后缀是.sra（请注意）：
1. 单端数据：
```shell
for id in SRR799545  SRR799544;    do pfastq-dump --threads 10 -s $id --gzip;    done
```

2. 双端数据：
```shell
for id in SRR799545  SRR799544;    do pfastq-dump --threads 10 -s $id --split-3 --gzip;    done
```
我试过了，这个软件没有想象中的快，所以还在找其他的。

#### ***UPDATE 20191030:***
因为上述所说的`pfastq-dump`没有达到我的目标，在`ncbi`的官方工具中，发现最新版的sratoolkit中有一个`fasterq-dump，a faster fastq-dump`的软件，[官方介绍在这里](https://github.com/ncbi/sra-tools/wiki/HowTo:-fasterq-dump)，从官方介绍中可以发现`fasterq-dump`利用了临时文件和多线程的方式来提升提取`fastq`文件的速度，而且`fasterq-dump`的用法和`fastq-dump`是一样的，例子如下：

```shell
##建议使用最新版，现在的sratool的最新稳定版本是2.9.6，在github上面的release版本是2.10.0，如果不愿意自己安装的可以到[ncbi官方ftp下载](https://ftp-trace.ncbi.nlm.nih.gov/sra/sdk/current/)，想自己在服务器上安装的请参考[官方介绍](https://github.com/ncbi/sra-tools/wiki/Building-and-Installing-from-Source)
​```shell
wget -O sratoolkit.tar.gz  https://ftp-trace.ncbi.nlm.nih.gov/sra/sdk/current/sratoolkit.current-ubuntu64.tar.gz
tar xzvf sratoolkit.tar.gz
echo 'PATH=/path/of/the/sratoolkit-2.9.6/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
which fasterq-dump
fasterq-dump
Usage:
  fasterq-dump <path> [options]

Options:
  -o|--outfile                     output-file
  -O|--outdir                      output-dir
  -b|--bufsize                     size of file-buffer dflt=1MB
  -c|--curcache                    size of cursor-cache dflt=10MB
  -m|--mem                         memory limit for sorting dflt=100MB
  -t|--temp                        where to put temp. files dflt=curr dir
  -e|--threads                     how many thread dflt=6
  -p|--progress                    show progress
  -x|--details                     print details
  -s|--split-spot                  split spots into reads
  -S|--split-files                 write reads into different files
  -3|--split-3                     writes single reads in special file
  --concatenate-reads              writes whole spots into one file
  -f|--force                       force to overwrite existing file(s)
  -N|--rowid-as-name               use row-id as name
  --skip-technical                 skip technical reads
  --include-technical              include technical reads
  -P|--print-read-nr               print read-numbers
  -M|--min-read-len                filter by sequence-len
  --table                          which seq-table to use in case of pacbio
  --strict                         terminate on invalid read
  -B|--bases                       filter by bases
  -h|--help                        Output brief explanation for the program.
  -V|--version                     Display the version of the program then
                                   quit.
  -L|--log-level <level>           Logging level as number or enum string. One
                                   of (fatal|sys|int|err|warn|info|debug) or
                                   (0-6) Current/default is warn
  -v|--verbose                     Increase the verbosity of the program
                                   status messages. Use multiple times for more
                                   verbosity. Negates quiet.
  -q|--quiet                       Turn off all status messages for the
                                   program. Negated by verbose.
  --option-file <file>             Read more options and parameters from the
                                   file.

./bin/fasterq-dump : 2.9.6

fasterq-dump --split-3 SRR799545.sra
##使用过程中，大家都关心的参数来了，就是-e|threads，用于选择使用多少个线程来进行提取fastq文件，默认如上是6个线程。另外考虑到有人想查看提取进度，还提供了-p选项用于显示当前提取任务的进度。
fasterq-dump --split-3 SRR799545.sra -e 20 -p
```
时间上来说，`fasterq-dump`确实会使用更少的时间，还可以设置memory、cache的大小来提速，但是有一个问题，如果大家进行大量文件提取的时候，一定要注意你的服务器的空闲的存储，因为`fasterq-dump`不提供--gzip的参数用于压缩文件，提取出来的fastq文件只是文本文件，记得压缩，减小存储压力。


									—— dulunar 后记于 2019.10