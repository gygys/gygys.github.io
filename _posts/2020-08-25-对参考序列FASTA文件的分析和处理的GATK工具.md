---
layout:     post
title:      对参考序列FASTA文件的分析和处理的GATK工具
subtitle:    reference genome, GATK
date:       2020-08-25
author:     dulunar
header-img: img/post-bg-hgf.jpg
catalog: true
tags:
    - genome
    - fasta
    - GATK
---

## GATK
GATK (全称The Genome Analysis Toolkit)是Broad Institute开发的用于二代重测序数据分析的一款软件。在4.0以后，GATK包含有Picard工具集，所有Picard工具都能够使用GATK完成。

## BaitDesigner
设计用于杂交捕获反应的寡核苷酸baits，设计用于杂交选择实验的custom bait sets
```shell
gatk BaitDesigner --DESIGN_NAME design_bait --REFERENCE_SEQUENCE ref_genome.fa --TARGETS targets.interval_list
```

## CreateSequenceDictionary 
建立reference genome序列的dict，用于gatk的下游分析
```shell
gatk CreateSequenceDictionary --REFERENCE ref_genome.fa
```

## FastaAlternateReferenceMaker
通过将Fasta与VCF结合来创建备用参考
```shell
gatk FastaAlternateReferenceMaker -R ref_genome.fa -O psuedo-genome.fa -L input.intervals -V input.vcf
```

## CountBasesInReference
计算参考基因组文件中每种碱基的数量
```shell
gatk CountBasesInReference --reference ref_genome.fa
```

## BwaMemIndexImageCreator 
创建用于GATK和BWA工具分析的BWA-MEM索引文件 .img
```shell
gatk BwaMemIndexImageCreator -I ref_genome.fa -O ref_genome.fa.img
```

## ExtractSequences
根据intervals区域信息从参考序列中导出一个新的fasta文件
```shell
gatk ExtractSequences --INTERVAL_LIST regions_of_interest.interval -R ref_genome.fa --OUTPUT extracted_IL.fa
```

## FastaReferenceMaker
根据intervals区域信息导出区域内的序列
```shell
gatk FastaReferenceMaker --reference ref_genome.fa --output IL.fa -L intervals
```

## FindBadGenomicKmersSpark 
识别参考中高频出现的序列
```shell
gatk FindBadGenomicKmersSpark -R ref_genome.fa -O kmers_to_ignore.txt
```

## NonNFastaSize 
计算fasta文件中非N碱基的数量
```shell
gatk NonNFastaSize --INPUT ref_genome.fa -O count.txt
```

## NormalizeFasta 
将FASTA文件中的序列的行规格化为相同长度
```shell
gatk NormalizeFasta --INPUT ref_genome.fa -O normalized.fa
```

## ScatterIntervalsByNs 
根据参考序列中的碱基类型{N, ACGT, BOTH}生成interval区间文件，
```shell
gatk ScatterIntervalsByNs -R ref_genome.fa --OUTPUT_TYPE ACGT -O output.interval_list
```


								—— dulunar 后记于 2020.08

