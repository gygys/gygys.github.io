---
layout:     post
title:      从NCBI-SRA和EBI-ENA数据库下载数据
subtitle:   下载测序数据
date:       2018-09-18
author:     dulunar
header-img: img/post-bg-bubble.jpg
catalog: true
tags:
    - 生信软件
    - SRA
    - 测序
---

## NCBI-SRA和EBI-ENA数据库

**SRA数据库**: Sequence Read Archive：隶属NCBI (National Center for Biotechnology Information)，它是一个保存大规模平行测序原始数据以及比对信息和元数据 (metadata) 的数据库，所有已发表的文献中高通量测序数据基本都上传至此，方便其他研究者下载及再研究。其中的数据则是通过压缩后以.sra文件格式来保存的，SRA数据库可以用于搜索和展示SRA项目数据，包括SRA主页和 Entrez system，由 NCBI 负责维护。SRA数据库中的数据分为Studies, Experiments, Samples和相应的Runs四个层次：
```markdown
Study：accession number 以 DRP，SRP，ERP 开头，表示的是一个特定目的的研究课题，可以包含多个研究机构和研究类型等。study 包含了项目的所有 metadata，并有一个 NCBI 和 EBI 共同承认的项目编号（universal project id），一个 study 可以包含多个实验（experiment）。

Sample：accession number以 DRS，SRS，ERS 开头，表示的是样品信息。样本信息可以包括物种信息、菌株(品系) 信息、家系信息、表型数据、临床数据,组织类型等。可以通过 Trace 来查询。

Experiment：accession number 以 DRX，SRX，ERX 开头。表示一个实验记载的实验设计（Design），实验平台（Platform）和结果处理 （processing）三部分信息。实验是 SRA 数据库的最基本单元，一个实验信息可以同时包含多个结果集（run）。

Run：accession number 以DRR，SRR，ERR 开头。一个 Run 包括测序序列及质量数据。

Submission：一个 study 的数据，可以分多次递交至 SRA 数据库。比如在一个项目启动前期，就可以把 study，experiment 的数据递交上去，随着项目的进展，逐批递交 run 数据。study 等同于项目，submission 等同于批次的概念。
```

**ENA数据库**：European Nucleotide Archive：隶属EBI (European Bioinformatics Institute)，功能等同SRA，并且对保存的数据做了注释，界面相对于SRA更友好，对于有数据需求的研究人员来说，ENA数据库最诱人的点应该是可以直接下载fastq (.gz)文件，由 EBI 负责维护。

两者在主要功能方面非常类似，同时数据互通。
<p id = "build"></p>
---

## SRA文件下载方式
需要获取他人发表的公开测序数据，来帮助自己的研究领域，下载.sra文件是为了获取该sra相对应的fastq或者sam文件，通过文件格式转换就可以和自己的pipeline对接上，用于直接分析，所以：

第一步，我们需要到SRA或者ENA上搜索我们选择好的SRR号或者SRS号或者SRP号，先在ENA上搜索，如没有再去SRA上搜索，因为ENA下载比SRA快。

第二步，下载数据，从 SRA 数据库下载数据有多种方法。可以用ascp快速的来下载 sra 文件，也可以用wget或curl等传统命令从 FTP 服务器上下载 sra 文件（但是wget和curl下载的sra文件有时候会不完整），另外NCBI的sratoolkit 工具集中的prefetch、fastq-dump和sam-dump也支持直接下载，另外[**biostar handbook**](https://www.biostarhandbook.com/)中有一个[**wonderdump脚本**](http://data.biostarhandbook.com/scripts/wonderdump.sh)也方便下载数据，我以前还用过迅雷下载sra文件，直接得到sra的链接，迅雷下载。

#### 1. Aspera
Aspera Connect软件，这是IBM旗下的商业高速文件传输软件，随着高通量数据的大量产生，从而对于大文件快速传输的需求，开始应用到生物领域，与NCBI和EBI有协作合同，我们可以免费使用它下载高通量测序文件，体验飞一般的感觉，速度可飚至300-500M/s。下载完成后，本地用fastq-dump提取fastq文件，用sam-dump提取SAM文件。

传统的FTP、HTTP等数据传输协议都是基于TCP的，TCP在远距离数据传输中存在一些先天的不足，文件越大、距离越远，其丢包、延时等问题对于传输速度和效率的影响就越大。

##### Aspera的安裝:
[**下载链接**](https://downloads.asperasoft.com/en/downloads/8?list)点击此处查看
```shell
## download aspera lastest version：
wget https://download.asperasoft.com/download/sw/connect/3.9.6/ibm-aspera-connect-3.9.6.173386-linux-g2.12-64.tar.gz
tar xzvf ibm-aspera-connect-3.9.6.173386-linux-g2.12-64.tar.gz

## install aspera in server:
sh aspera-connect-3.8.1.161274-linux-g2.12-64.sh

## 查看是否有.aspera文件夹  
cd  ## 去根目录 
ls -a   ## 如果看到.aspera文件夹，代表安装成功

## 永久添加环境变量
echo 'export PATH=~/.aspera/connect/bin:$PATH' >> ~/.bashrc  && cp ~/.bashrc~/.bash_profile
source ~/.bashrc ~/.bash_profile

## 查看帮助文档
ascp --help 
```
[**ascp的用法**](https://download.asperasoft.com/download/docs/connect/3.9.6/user_linux/webhelp/index.html)：ascp [参数] 目标文件 目标地址

先了解几个ascp命令的常用参数
-v    verbose mode 唠叨模式，能让你实时知道程序在干啥，方便查错。
-T    取消加密，否则有时候数据下载不了
-i    提供私钥文件的地址，免密从SRA和ENA下载，不能少，地址一般是~/.aspera/connect/etc中的asperaweb_id_dsa.openssh文件
-l    设置最大传输速度，一般200m到500m，如果不设置，反而速度会比较低，可能有个较低的默认值
-k    断点续传，一般设置为值1
-Q    用于自适应流量控制，磁盘限制所需
-P    用于SSH身份验证的TCP端口，一般是33001

##### ascp进行SRA数据库下载
***ps***：记住，SRA数据库的数据的存放地址是ftp-private.ncbi.nlm.nih.gov或者ftp.ncbi.nlm.nih.gov，SRA在Aspera的用户名是anonftp，下载范例：

```shell
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh anonftp@ftp.ncbi.nlm.nih.gov:/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976573/SRR2976573.sra ~/rawdata/ascp/
## 或者
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh anonftp@ftp-private.ncbi.nlm.nih.gov:/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976573/SRR2976573.sra ~/rawdata/ascp/
```
***注意***：anonftp@ftp-private.ncbi.nlm.nih.gov和anonftp@ftp.ncbi.nlm.nih.gov后面是“ : ”号，不是路径“ / ”！
熟悉的人应该知道，NCBI-SRA数据库的sra文件前面的地址都是一样的***/sra/sra-instant/reads/ByRun/sra/SRR/***...，可以根据需要下载的sra文件来编写脚本进行批量下载sra文件！
***/sra/sra-instant/reads/ByRun/sra/{SRR|ERR|DRR}/***<first 6 characters of accession>/<accession>/<accession>.sra
因为sra文件前面的地址是一样的，除了后两个字段，所以也可以通过把sra文件的id写到一个文档，使用ascp批量下载文档中所有的sra文件，举例如下：
```shell
cat SRR_Download_List
/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976568/SRR2976568.sra
/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976569/SRR2976569.sra 
/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976570/SRR2976570.sra 
/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976571/SRR2976571.sra 
/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976572/SRR2976572.sra 
/sra/sra-instant/reads/ByRun/sra/SRR/SRR297/SRR2976573/SRR2976573.sra

##使用 ascp批量下载该List下的sra文件：
ascp  -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh  --mode recv --host ftp-private.ncbi.nlm.nih.gov --user anonftp --file-list SRR_Download_List  ~/rawdata/ascp/

或者，host不同的情况下：
ascp  -v -QT -l 400m -P33001 -k1 -i  ~/.aspera/connect/etc/asperaweb_id_dsa.openssh  --mode recv --host ftp.ncbi.nlm.nih.gov --user anonftp --file-listSRR_Download_List   ~/rawdata/ascp/ 
```

#### sratoolkit进行SRA数据库下载
NCBI 开发了 sratoolkit 工具来帮助处理 SRA 数据，正确配置后可以很方便的下载 SRA 数据。可以直接从 [NCBI](https://trace.ncbi.nlm.nih.gov/Traces/sra/sra.cgi?view=software) 上下载。最新的源码可以在 [Github](https://github.com/ncbi/sra-tools) 获得。
另外，如果你安装并设置了 [Aspera Connect](https://download.asperasoft.com/download/docs/connect/3.9.6/user_linux/webhelp/index.html)，那么 prefetch 会优先使用ascp方式来下载，如果没有安装或则ascp下载失败，则切换成 HTTP 方式下载 sra 数据。另外 [fastq-dump](https://edwards.sdsu.edu/research/fastq-dump/)命令（大概的命令）也能从远端直接下载数据，加上-X 1参数，会预先下载最前的5个 reads，加上-Z参数，则会将这些 reads 打印到终端输出。
```shell
/path of sratoolkit/prefetch -t ascp -a “~/.aspera/connect/etc/asperaweb_id_dsa.openssh” SRR2976573
/path of sratoolkit/fastq-dump -X 5 -Z SRR2976573
```

#### ascp进行ENA数据库下载
从ENA数据库进行下载，ENA数据库的数据存放位置是***fasp.sra.ebi.ac.uk****，ENA在Aspera的用户名是***era-fasp***，****era-fasp@fasp.sra.ebi.ac.uk***。如果要从ENA数据库下载[SRR2976573](https://www.ebi.ac.uk/ena/data/view/SRR2976573)，我们先搜索：
![ENA界面简介](C:\Users\dulun\Desktop\13150724-ef0648c9291f55ec.png)

从截图中，我们可以发现我们可以自己设定显示哪些title（如：FASTQ files (Aspera)、FASTQ files (FTP)、NCBI SRA file (FTP)、NCBI SRA file (Aspera)）在表格中，再点击下载TEXT，可以在本地保存需要的信息，以便后期的数据下载。

单个数据下载例子，可以是sra文件，也可以是fastq.gz文件：
```shell
####sra文件下载：
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh era-fasp@fasp.sra.ebi.ac.uk:/vol1/srr/SRR297/003/SRR2976573  ~/rawdata/ascp/ 

####FASTQ文件下载；
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh  era-fasp@fasp.sra.ebi.ac.uk:/vol1/fastq/SRR297/003/SRR2976573/SRR2976573_1.fastq.gz  ~/rawdata/ascp/
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh era-fasp@fasp.sra.ebi.ac.uk:/vol1/fastq/SRR297/003/SRR2976573/SRR2976573_2.fastq.gz  ~/rawdata/ascp/
```
批量从ENA下载数据，比如我们在ENA搜索[SRP067062](https://www.ebi.ac.uk/ena/data/view/PRJNA305211)，我们得到该number的页面，在搜索结果中设置显示项目，再下载TEXT，我们导入到excel中，截取需要的字段，如下：
分为SRA文件的txt和FASTQ文件的TXT：
```markdown
####ENA-Aspera-FASTQ.txt：
/vol1/fastq/SRR297/002/SRR2976562/SRR2976562_1.fastq.gz
/vol1/fastq/SRR297/002/SRR2976562/SRR2976562_2.fastq.gz
/vol1/fastq/SRR297/003/SRR2976563/SRR2976563_1.fastq.gz
/vol1/fastq/SRR297/003/SRR2976563/SRR2976563_2.fastq.gz

####ENA-Aspera-SRA.txt：
/vol1/srr/SRR297/002/SRR2976562
/vol1/srr/SRR297/003/SRR2976563 
```
##### 批量下载代码：
```shell
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh--mode recv --host fasp.sra.ebi.ac.uk --user era-fasp --file-list ENA-Aspera-FASTQ.txt  ~/rawdata/ascp/
## 上面代码下载FASTQ.gz文件
## 下面代码下载的是SRA文件
ascp -v -QT -l 400m -P33001 -k1 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh --mode recv --host fasp.sra.ebi.ac.uk --user era-fasp --file-list  ENA-Aspera-SRA.txt   ~/rawdata/ascp/
```

### 遇到的问题
ascp下载ENA数据的时候有可能会出现Session Stop，解决方案：
第一、把ascp 的-l 不要设置的太大了，一般设置为500m就可以了；
第二、在root权限下设置udp端口
使用iptable设置如下：
```shell
iptables -I INPUT -p udp --dport 33001 -j ACCEPT
iptables -I OUTPUT -p udp --dport 33001 -j ACCEPT
```
### 总结
Aspera Connect的下载速度是最快的，相对于sratoolkit的套件下载和wget或者curl下载；并且Aspera的下载可以下载fastq文件和SRA文件，免去了SRA转至FASTQ的过程，该过程很耗时，特别耗时！

### References
[SRA数据加速下载打包解决](https://anjingwd.github.io/AnJingwd.github.io/2017/08/06/SRA格式数据加速下载打包解决/)

[使用aspera下载.fastq.gz和.sra数据](https://blog.csdn.net/herokoking/article/details/78890567)

[第1节. 公共数据库获取数据](https://ngs-data-for-pathogen-analysis.readthedocs.io/zh_CN/latest/chapter_01/01_get_data.html)

								—— dulunar 后记于 2018.9