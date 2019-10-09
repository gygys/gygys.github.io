---
layout:     post
title:      Annovar各程序的功能 自建avdb 构建索引
subtitle:   annovar的使用
date:       2019-09-20
author:     dulunar
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - 生信软件
    - 注释
    - Perl
    - 数据结构
---

##### ANNOVAR的程序模块（本人目录）
```markdown
├── annotate_variation.pl   //annovar主程序，功能包括下载数据库，三种不同的注释
├── annovar_index.pl   //index构建的程序，对于染色体是第一列的文件有效，修改网上程序
├── coding_change.pl   //用来推断蛋白质序列的程序
├── convert2annovar.pl   //可以转换各种不同格式的文件到.avinput，适合后期输出txt文件
├── example   //例子和一些有用的文件
├── humandb   //人类注释所用到的数据库的文件夹目录
├── idx_annovar.pl   //index构建的程序，对于染色体是第一列的文件有效，自写
├── index_annovar.pl   //来自annovar作者王凯老师的index构建程序
├── prepare_annovar_user.pl   //重新格式化并准备annovar注释数据库，比如COSMIC、CLINVAR
├── retrieve_seq_from_fasta.pl   //从全基因组fasta文件重新格式化特定基因组位置的序列
├── summarize_annovar.pl   //自动运行的流程，注释突变文件并获得以逗号分隔的文件中
├── table_annovar.pl   //注释程序，可一次性完成三种类型的注释，输出可以是csv/txt
└── variants_reduction.pl   //可用来更灵活地定制过滤注释流程
```
**PS：**
1. 上述有些程序来自于很早以前的收藏，还有两个来自于网上和自写；
2. convert2annovar.pl 支持的格式：pileup, cg, cgmastervar, gff3-solid, soap, maq, casava, vcf4, vcf4old, rsid, maq, annovar, annovar2vcf, bed, region, transcript.
##### 自建avdb
因为一些特定的注释数据库在annovar中是不一定提供的，那么如果想和annovar一起注释，要如何操作呢？举个例子，想注释[CCRs(constrained coding regions)](https://github.com/quinlan-lab/ccrhtml)到突变结果中，这个数据库是基于区域的有害性预测打分工具。首先[下载](https://s3.us-east-2.amazonaws.com/ccrs/ccrs/ccrs.autosomes.v2.20180420.bed.gz)数据文件，还有[X染色体](https://s3.us-east-2.amazonaws.com/ccrs/ccrs/ccrs.xchrom.v2.20180420.bed.gz)。

###### CCRs的数据库构建
先看一下下载的文件的格式：
![CCRs的格式](https://img-blog.csdnimg.cn/20190920210855474.png)
这个数据库中，其实有用的自由第四列，但是前三列代表region，也是需要的，所以，只需要把钱四列截取出来：
```shell
gzip -dc ccrs.autosomes.v2.20180420.bed.gz | grep -v '^#' cut -f 1-4 > hg19_CCRs.txt
```
这一步的目的有三个，一是留取有用的信息，二是减小数据库的大小，三是从bed文件转为txt的文件后缀，annovar的数据库的命名格式，一般是hg19_dbname.txt/hg18_dbname.txt/hg38_dbname.txt等等，便于程序识别读取数据库。
单单修改成这样是不足以用于注释，在注释的主程序中，对于dbtype也有一个设定，如果想使用CCRs，这里有两种方法，第一种修改annotate_variation.pl这个主程序，第二种就是修改这个文件的格式。
先看一下主程序关于dbtype的选择，也就是文件格式的匹配，在annotate_variation.pl的第2998行，有一个预设，如下图：
![annovar主程序关于dbtype的预设](https://img-blog.csdnimg.cn/20190920213506281.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3l1eXVlbmE=,size_16,color_FFFFFF,t_70)
上图中有三个红框，可以发现关于dbtype的预设有很多匹配，第二个红框里面是我修改了，加入了ccrs这个匹配，因为这个文件格式其实和和CCRs的格式是一致，position是1、2、3列，第四列是需要的输出列，这就可以开始注释了；
第二种方法就是我们看第三个红框，这个红框是对于其他所有的未知的格式来进行匹配，我们先看一下源码中的格式类型，第2、3、4列是position，第五列是需要的输出列，按照这个格式，我们可以修改获得的hg19_CCRs.txt这个文件，只需要给这个文件加第一列，这里我选择原文件的最后一列：
```shell
gzip -dc ccrs.autosomes.v2.20180420.bed.gz | cut -f 13 grep -v "unique" > first.txt
paste first.txt hg19_CCRs.txt > hg19_ccrs.txt
```
修改完的文件就可以用于注释：
```shell
perl convert2annovar.pl -format vcf4old samp.raw.vcf > samp.avinput
perl table_annovar.pl samp.avinput humandb/ -outfile samp.anno -buildver hg19 -protocol ccrs -operation r -nastring . -remove --otherinfo
```
这里的数据库不大，可以构建hg19_ccrs.txt的索引，也可以不用构建；构建索引的程序可以给王凯老师发邮件获得，我以前不知道，自己写了一个能用的idx_annovar.pl：
```perl
#!/usr/bin/perl -w
use strict;
use Getopt::Long;
use File::Basename;
use POSIX qw(strftime);
my ($in,$bins,$help);
GetOptions
(
        "i|in=s"=>\$in, "b|bins=i"=>\$bins,     "help|?"=>\$help,
);
my $usage=<<INFO;
Usage:
        perl $0 [options]
Options:
                -i <file> <in.input the database file for indexing>
                -b <INT> <bin.size the size of the index's bin>
INFO
die $usage if ($help || !$in || !$bins);
open IN,"$in" || die $!;
my $out = ${in} . ".idx";
my $size_in = -s $in;
my $len = 0;
my %idxLast=();
my %idxFirst=();
my $key_bin = 0;
$idxLast{$key_bin} = 0;
while(<IN>){
	my ($chr, $start, $end) = (split /\t/, $_)[0, 1, 2];
	$chr =~ s/^chr//i;
	my $bin_start =$bins * int($start/$bins);
	$len += length $_;
	$key_bin = "$chr-$bin_start";
	if(exists $idxLast{$key_bin}){
		$idxLast{$key_bin} = $len;
	}
    else{
		$idxFirst{$key_bin} = $len - length $_;
		$idxLast{$key_bin} = $len;
	}
}
close IN;

open OUT,"> $out" || die $!;
print OUT "#BIN\t$bins\t$size_in\n";
foreach(sort keys %idxFirst){
	my ($chr, $bin_start) = split /\-/, $_;
	next unless($chr !~ /^#/);
	print OUT "$chr\t$bin_start\t$idxFirst{$_}\t$idxLast{$_}\n";
}
close OUT;
```
对于一般的数据库，就是Chr、Start、End、Score的类型的文件没有问题，可以使用；

 								—— dulunar 后记于 2019.09