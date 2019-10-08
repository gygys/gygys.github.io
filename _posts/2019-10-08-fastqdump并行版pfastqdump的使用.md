---
layout:     post
title:      fastqdump并行版pfastqdump的使用
subtitle:    "\"并行版fastq-dump\""
date:       2019-10-08
author:     dulunar
header-img: img/post-bg-2015.jpg
catalog: true
tags:
    - 生信软件
	- SRA
---

> “🙉🙉🙉 ”


## 前言

fastq-dump转换SRA文件到fastq文件很慢，并行版本成为趋势；

无论怎么换，先要打好基础，使用并行版本的前提是要保证NCBI的fastq-dump可以在服务器上正常运行。

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

使用pfastq_dump，因为pfastq_dump是基于fastq_dump写的一个bash程序，所以参数是相同的:

1. 对于单端数据转换，转换后文件是fq.gz：
```shell
for id in *sra;    do pfastq-dump --threads 10 ./$id --gzip;    done 
```

2. 对于双端数据转换，转换后文件是fq.gz：
```shell
for id in *sra;        do pfastq-dump  --threads 8 ./$id --split-3 --gzip;    done 
```

直接用sra号下载并解压fastq文件，但是推荐下载好文件再使用fastq_dump转换，且文件后缀是.sra（请注意）：
1. 单端数据：
```shell
for id in SRR799545  SRR799544;    do pfastq-dump --threads 10 -s $id --gzip;    done
```

2. 双端数据：
```shell
for id in SRR799545  SRR799544;    do pfastq-dump --threads 10 -s $id --split-3 --gzip;    done
```

我试过了，这个软件没有想象中的快，所以还在找其他的。

																	—— dulunar 后记于 2018.9