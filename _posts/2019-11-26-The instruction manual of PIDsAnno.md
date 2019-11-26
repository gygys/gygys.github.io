---
layout:     post
title:      The instruction manual of PIDsAnno
subtitle:    PIDs Anno
date:       2019-11-26
author:     dulunar
header-img: img/post-bg-seus.jpg
catalog: true
tags:
    - PIDs
---

# **The instruction manual of PIDsAnno**

```markdown
Author: Na Lu <nlu@seu.edu.cn>
Lastest Update Date: 2019.10.31
Address: Alfred Nobel allé 8, Huddinge, Stockholm, Sweden
```


### Introduction
The pipeline was built in Ubuntu 18.04 operation system. The system was installed in dickC with WSL (windows subsystem for Linux) on Windows 10 operation system. We can load the workstation by Putty software, IP is “10.229.200.216”, port is 2222, user name is “luna”, password is “ln..”. And when we load the Ubuntu, we will enter the path (/home/luna), there have two directories: diskD and diskF, diskD is the d disk of windows and diskF is the f disk of windows, the two directories can store results from pipeline and raw data for pipeline, also can copy data from KI Sever in windows and then we can use these data in the ubuntu directly. We also can see the results from pipeline in the windows directly.

### All disks of Windows can used in the Ubuntu, their relationships is like these:
```markdown
C:\      is        /mnt/c
D:\      is        /mnt/d
F:\       is        /mnt/f
P:\PHA       is        /mnt/shareP
```
In Ubuntu system, some paths located on the windows10 position:
```markdown
/home/luna/work/PIDsAnno   is   d:\datashared1\work\PIDsAnno
/home/luna/work/RawData    is   F:\datashared2\rawdata
```
After batch analysis finished, we can enter the directory in windows system and open files and check the results.
#### Databases:
##### GATK’s database, for calling SNV:
```markdown
/home/luna/Desktop/database/gatkbundle is   d:\datashared1\database\gatkbundle
```
##### Annovar’s database, for annotating variants:
```markdown
/home/luna/Desktop/Software/annovar/humandb is d:\datashared1\database\tannovar\humandb
```
##### VEP’s database, for annotating:
Because of the size of database is not large, so I just put the database in diskC:
```markdown
/home/luna/Desktop/Software/ensembl-vep/database
```



### Toolkits introduction

All scripts of this pipeline were stored in the path: 
```shell
/home/luna/Desktop/Software/PIDsAnno
```
In this path, we have useful scripts, tools and lists for annotating, the descriptions as follow:
```shell
├── 0.01_blacklist_full_HA.txt  # the blacklist for filtering
├── annotated.Merge  #merge file from annovar & vep, combine blacklist and genes
├── candidategene.txt  #the candidate genes list of PIDs
├── CombineSamp  #after analyzing samples of the batch, Merge to BigData with TAGs
├── CompareFamilys  #the members of family’s compare
├── convertAV2vep  #convert the annovar input to vep input
├── convertGFF2av  #if the variant’s format is GFF, convert to annovar input
├── CopynumberExon  #call CNV of PIDs genes exons for all sample in the list
├── FilterbyAnno2Merge  #filter the merged data by freq, blacklist, genes, exonic
├── knowngene.txt  #the known genes list of PIDs
├── selectedFromVEP  #convert the output of vep to TAB txt
├── PIDsAnnoPipe  #the complete pipeline, contains annotate, merge, filter
├── txt2xlsx #convert Tab Text files to one xlsx, one txt one sheet, more advanced
├── bam2vcf #generate vcffile from bamfile
├── runHLArepoter 
├── runOptiType
├── hlaopti.sh # help for OptiType
├── runPolysolver
└── fastq2bam #genarate bamfile from fastqfiles.
```

#### Fq to Bam command line:
We can generate bam file from raw fastq, the script in here:
```markdown
/home/luna/Desktop/Software/PIDsAnno/fastq2bam
```
**The command as following:**

```shell
/home/luna/Desktop/Software/PIDsAnno/fastq2bam –i / home/luna/work/RawData/TargetRaw/A6.lst –od /home/luna/work/RawData/TargetRaw
```
If the raw data was **not cleaned**  data, please add ** –t**  to process ** reads trimming** .

And the format of list likes, each element was separated by Tab:
```shell
SampleID"Tab"ReadGroup"Tab"Library"Tab"Fastq1"Tab"Fastq2"Tab"
TG-LH-A6 TG-LH-A6 TG-LH-A6 /mnt/shareP/PID/BGI-TARGET-runs-PID/Target-Region-Iranian/A1-C4/fq/TG-LH-A6_pe_1.fq.gz /mnt/shareP/PID/BGI-TARGET-runs-PID/Target-Region-Iranian/A1-C4/fq/TG-LH-A6_pe_2.fq.gz
```

In this step, we use the list contains **SampleID, Read Group, Library, Path-of-Fastq1, Path-of-Fastq2** as input, then generate a bam file which **sorted and duplication marked**. The path of the final file is **/home/luna/work/RawData/TargetRaw/ TG-LH-A6.markdup.bam,** also has the index files of this bam file;

The list can contain many samples, one line for each sample, the program will process it in order one by one, and generate bam file.

**The usage of this script:**
```shell
Usage:
	/home/luna/Desktop/Software/PIDsAnno/fastq2bam [options]
Options:
		-i|in <file> <in.input file> <Format:
		SampleID"Tab"ReadGroup"Tab"Library"Tab"Fastq1"Tab"Fastq2"Tab">
		-t|trim <Indicate whether the original sequence data will be trimmed and cleaned>
		-od <directory> <the output file's directory>
```

#### Bam to VCF command line:

After we generated marked duplication bam file, we can use the script for generating VCF file from the marked duplication bam file with GATK, the script in here:
```shell
/home/luna/Desktop/Software/PIDsAnno/bam2vcf
```
**The command as following:**
```shell
/home/luna/Desktop/Software/PIDsAnno/bam2vcf -i /home/luna/work/RawData/TargetRaw/novcfgatk.lst -o /home/luna/work/RawData/TargetRaw -d -s -g 4 -L /home/luna/Desktop/database/hg19ucsc/PIDsgeneAndTR219gene.region.interval_list
```
In here, if the bam files were **sorted (-t)** and **marked duplication (-d)**, please remind. If the data is **target sequence or exome sequence**, can add **-L** to add a interval file, another, **-g** also need to set on target sequence, below 5.

**The usage of this script:**

```shell
Usage:
	/home/luna/Desktop/Software/PIDsAnno/bam2vcf [options]
Options:
		-i|in <file> <in.input file> The format of the list:
		SampleID Sample's bamfiles <sample.bam> or <sample.1.bam sample.2.bam ...  
		sample.N.bam> or <chr1.bam  chr2.bam ... chrY.bam>
        -o|out <directory> <the directory for store output file>
        -d|dup <whether the bam file has beed marked duplicate>
        -s|sort <Indicates whether the bam file has been sorted>
        -g|gs <INT> <the value of --max-gaussians used in GATK,
        Default is 6, for snp is gs, for indel is int(gs/2)>
        -L  <file>  <the IntervalList from bed for GATK> for example:
        /home/luna/Desktop/database/hg19ucsc/PIDsgeneAndTR219gene.region.interval_list
```
### PIDsAnno Pipeline

In this instruction, I used the work **Patients.2019-10-30** as a example, please know it.

In this pipeline, first we will convert the VCF files of SNP&&INDEL to input format of annovar and VEP; then annotate this batch by using Annovar and VEP; next we will convert the output of VEP VCF to TAB txt file; next we will call the PIDs known genes all exon’s copy number of this batch; and then merge the two annotated files to one file with blacklist tag (**1: in blacklist, 0: is not blacklist**) and known genes (**0: no PIDs genes, AD/AR/XL: PID genes type**) and candidate genes (**0: no Candidate gene, 1: gene**) and copy number (**.: snp and indel, float number: region depth/average depth of the region**); after merging we need to filter the file with blacklist (**no blacklist**) and frequencies and known genes (**have PIDs Genes**) and site’s region (**exonic and splicing**), and count the number of variants after filtering at each step, the pipeline will combine each filter’s results to an **XLSX table**, one sample one **XLSX**, can be download to your computer for following analyzing. After finishing the analysis, we edit the **TAG file**, then we combine the batch to the **BigData** for GWAS analysis. The TAG file and the Big database Combine Sample file in this path

```shell
/home/luna/work/PIDsAnno/BigData/SamplesProcess.TAG.txt
/home/luna/work/PIDsAnno/BigData/Bigdatabse.CombineSamp.txt
## the path upon is in ubuntu, and the windows path is here:
d:\datashared1\work\PIDsAnno\BigData\SamplesProcess.TAG.txt
d:\datashared1\work\PIDsAnno\BigData\Bigdatabse.CombineSamp.txt
```
#### Set raw data destination:
```shell
## /home/luna/work/RawData    is   F:\datashared2\rawdata
mkdir -p /home/luna/work/RawData/Patients.2019-10-30
cd /home/luna/work/RawData/Patients.2019-10-30
cp /path/sample/for/analyzed/sample.bam /path/sample/for/analyzed/sample.vcf /path/sample/for/analyzed/sample.bai /home/luna/work/RawData/Patients.2019-10-30/
#Through this step, we can copy raw file for PIDsAnno, and this directory just for storing raw data for this work.
# and the directory also exists in windows, F:\datashared2\rawdata\Patients.2019-10-30, can also copy data to that directory by using windows.
```
In this step, I recommend use copy and not create link for these samples which were stored in KI server. Because soft link will influence the speed of analysis Pipeline. **Another, when copy data (bam, VCF and bai file) to the directory, please make sure that the name of the file contain the complete name of the sample which we want to analysis. It is very important, Please pay attention to it.** In addition, IF the raw directory has the .BAI file for .BAM file, if **the final time of the .BAI is later than the time of the .BAM**, we should copy the .BAI  file to the directory, if not, do not copy, we will re-index the bam file during analysis processing.

The name of raw data must like as follow: 
```shell
SampleName.XXXXX.bam
SampleName.XXXXX.vcf or SampleName.XXXXX.vcf.gz
SampleName.XXXXX.bam.bai or SampleName.XXXXX.bai
## SampleName should contains numbers, letters, symbols only, does not include "." in SampleName.

/home/luna/work/RawData/Patients.2019-10-30
├── BGI-LH-EX794.bai
├── BGI-LH-EX794.bam
├── BGI-LH-EX794.indel.vcf.gz
├── BGI-LH-EX794.snp.vcf.gz
......
├── BGI-LH-EX802.bai
├── BGI-LH-EX802.bam
├── BGI-LH-EX802.indel.vcf.gz
├── BGI-LH-EX802.snp.vcf.gz
├── BGI-LH-EX803.bai
├── BGI-LH-EX803.bam
├── BGI-LH-EX803.indel.vcf.gz
└── BGI-LH-EX803.snp.vcf.gz
```

#### **Create and enter work directory:** 
```shell
mkdir –p /home/luna/work/PIDsAnno/Patients.2019-10-30 # creat directory
cd /home/luna/work/PIDsAnno/Patients.2019-10-30 #enter the directory
ls or lt or ll or lf #list all files of this directory, except the hidden files
```
The directory **/home/luna/work/PIDsAnno/Patients.2019-10-30** is the work path, store the results. This directory also can be seen at windows directly: 
```shell
d:\datashared1\work\PIDsAnno\Patients.2019-10-30
```
**Only patients** want to be analyzed will be stored in the directory!
**Estimated Running time ~~ 1 hour/ patient**, for target less time, if the bam file's index can used will reduce times, in additional, copy the data into the 
`/home/luna/work/RawData/Patients.2019-10-30`

#### **How to achieve Sample ID**
**(folder for each patient)** *Outdated and Deprecated*
```shell
ls ~/LunaDisk/Databases/NewPatients | grep EX | perl -ne 'chomp;$dir = "~/LunaDisk/Databases/NewPatients/$_";print "$_";$i = `find $dir/ -name "\*.bam"`; chomp $i; my @F =split /\s+/, $i; for my $l(@F){chomp $l;print "\t$l";} $j = `find $dir/ -name "\*.vcf.gz"`; chomp $j;my @F = split /\s+/, $j; for my $c(@F){chomp $c; print "\t$c";} print "\n";' > sample.lst
```

**(all patients in one folder)**  *Outdated and Deprecated*
```shell
ls /home/luna/work/RawData/Patients.2019-10-30/*.bam | grep TG | perl -ne 'chomp;$dir = "/home/luna/work/RawData/Patients.2019-10-30";($nm)=$_=~/(.\*)\.bam/; print "$nm";$i = `find $dir/ -name "\*$nm\*.bam"`; chomp $i; my @F =split /\s+/, $i; for my $l(@F){chomp $l;print "\t$l";} $j = `find $dir/ -name "\*$nm\*.vcf.gz"`; chomp $j;my @F = split /\s+/, $j; for my $c(@F){chomp $c; print "\t$c";} print "\n";' > /home/luna/work/PIDsAnno/first.samp.lst
```

#### **(all patients in one folder)** 
***The latest applicable* **

 ```shell
ls /home/luna/work/RawData/Patients.2019-10-30/ | grep ".bam" | perl -ne 'chomp;($nm)=(split /\./, $_)[0]; $dir = "/home/luna/work/RawData/Patients.2019-10-30"; if(`find $dir/ -name "*$nm*.bam"` && (`find $dir/ -name "*$nm*.vcf"` || `find $dir/ -name "*$nm*.gff"`)){print "$nm\n";}' > /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst
 ```

**(Selected patients from all patients in one folder)**
*Outdated and Deprecated*
First select the folder and Then chose the ID, then check the SampleID
```shell
cd /home/luna/work/RawData/Patients.2019-10-30
ls *.bam | grep -E "EX364|EX365|EX368|EX369|EX370" | perl -ne 'chomp;$dir = "~/work/RawData";($nm)=$_=~/(.\*)\.bam/; print "$nm";$i = `find $dir/ -name "\*$nm\*.bam"`; chomp $i; my @F =split /\s+/, $i; for my $l(@F){chomp $l;print "\t$l";} $j = `find $dir/ -name "\*$nm\*.vcf.gz"`; chomp $j;my @F = split /\s+/, $j; for my $c(@F){chomp $c; print "\t$c";} print "\n";' > /home/luna/work/PIDsAnno/first.samp.lst
cat /home/luna/work/PIDsAnno/first.samp.lst
```

#### **Selected some special patients from many patients in one folder**
*The latest applicable* 

 ```shell
cd /home/luna/work/RawData/Patients.2019-10-30
ls *.bam | grep -E "EX364|EX365|EX368|EX369|EX370" | perl -ne 'chomp; ($nm) = (split /\./, $_)[0]; $dir = "/home/luna/work/RawData/Patients.2019-10-30"; if(`find $dir/ -name "*$nm*.bam"` && (`find $dir/ -name "*$nm*.vcf"` || `find $dir/ -name "*$nm*.gff"`)){print "$nm\n";}' > /home/luna/work/PIDsAnno/Patients.2019-10-30/id.special.lst
 ```

**Set VCF and Bam:**  ***Outdated and Deprecated***
Prepare files for pipeline’s input, a list: sample.lst, one sample for one line, including SampleID, BamFile, VariantFile, and separated by Spaces or Tabs.
The format is like if not merged vcf or not merged bam:
```shell
EX210	/PathofEX210/EX210.bam	/Path/EX210/EX210.gatkHC.vcf.gz
EX778	/PathofEX778/EX778.bam	/Path/EX778/EX778.snp.vcf.gz	/Path/EX778/EX778.indel.vcf.gz
EX248	/home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chr1.bam	/home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chr10.bam	/home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chr11.bam	/home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chr12.bam	...	/home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chrU.bam    /home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chrX.bam  /home/luna/LunaDisk/Databases/NewPatients/EX248/bamfiles/chrY.bam    /home/luna/LunaDisk/Databases/NewPatients/EX248/BGI-LH-SWE-EX248_sample.gatkHC.vcf.gz	 /Path/EX248/EX248.indel.vcf.gz
```

#### Run the PIDsAnno Pipeline 
##### for annotating variants and calling copy number and merging and comparing family in all patients
Through the above steps, we have finished copy raw data to the special directory and create a directory for working and achieve the list of all samples' name, now we need to run the pipeline for annotating all patients in the list.
```shell
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -c -v -m -in /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30 -fmr BGI-LH-EX794 -freq 0.01
```
In this work, we want to analysis all members of a family, from snp, indel and copy number, then we will merge the annotated results of each sample to one merged file, filter with some filter conditions.

In the work directory, we will generate Sample's directory:
```shell
/home/luna/work/PIDsAnno/Patients.2019-10-30
├── BGI-LH-EX794
├── BGI-LH-EX795
├── BGI-LH-EX794_BGI-LH-EX803.batch.final.txt
├── BGI-LH-EX794_BGI-LH-EX803.batch.final.xlsx
├── BGI-LH-EX794_BGI-LH-EX803.batch.merge.lst
├── BGI-LH-EX794_BGI-LH-EX803.batch.stat.txt
├── BGI-LH-EX794_BGI-LH-EX803.batch.stat.txt.merge
├── BGI-LH-EX794_BGI-LH-EX803.batch.stat.txt.merge.log
├── BGI-LH-EX796
├── BGI-LH-EX797
├── BGI-LH-EX798
├── BGI-LH-EX799
├── BGI-LH-EX800
├── BGI-LH-EX801
├── BGI-LH-EX802
├── BGI-LH-EX803
├── BigData -> /home/luna/work/PIDsAnno/BigData -> d:\datashared1\work\PIDsAnno\BigData\
├── Familys
└── id.lst
```

**In the directory of each sample, we will generate some files as follow:**

```shell
samplename/ #the smaple's directory
├── samplename.avinput #the input file for annovar
├── samplename.anno.hg19_multianno.txt.gz #the result from annovar
├── samplename.vepinput #the input for vep from avinput
├── samplename.vepTab.txt.gz #the result from VEP
├── samplename.merge.txt.gz #merge annovar vep cnv
├── samplename.1freq.txt.gz #filter with frequence
├── samplename.2blist.txt.gz #filter with blacklist
├── samplename.3PIDs.txt.gz #filter with PIDs Genes
├── samplename.4exon.txt.gz #filter with exon and splice
├── samplename.filt.xlsx #merge the upon four txt file to a xlsx file, sheet
└── samplename.merged.xlsx #convert samplename.merge.txt.gz	 to xlsx file
##example
BGI-LH-EX794/
├── BGI-LH-EX794.1freq.txt.gz
├── BGI-LH-EX794.2blist.txt.gz
├── BGI-LH-EX794.3PIDs.txt.gz
├── BGI-LH-EX794.4exon.txt.gz
├── BGI-LH-EX794.anno.hg19_multianno.txt.gz
├── BGI-LH-EX794.avinput
├── BGI-LH-EX794.filt.xlsx
├── BGI-LH-EX794.merge.txt.gz
├── BGI-LH-EX794.merged.xlsx
├── BGI-LH-EX794.vepTab.txt.gz
└── BGI-LH-EX794.vepinput
```

**In the work directory, we also create some directories: **

```shell
BigData/ #merge all patients' variants to the BigData file, stored in this directory
├── Bigdatabse.CombineSamp.txt #the BigData file
├── Bigdatabse.CombineSamp.txt.backup
└── SamplesProcess.TAG.txt #the TAG file for specialing sample's finished
Familys/ #the result from family compared
├── BGI-LH-EX794.family.lst
├── family.BGI-LH-EX794.txt.gz
└── family.BGI-LH-EX794.xls
```
After all steps were finished, we can enter the directory `/home/luna/work/PIDsAnno/Patients.2019-10-30` to check the results of each sample. You also can enter the path `d:\datashared1\work\PIDsAnno\Patients.2019-10-30` in windows 10 directly.

**The command of the pipeline has several parameters, need to pay attention**

```shell
-c means call copynumber
-v means annotate variant (SNP && Indel)
-m means merge two annotated file and Copynumber and some tags together
-i XXX.lst the input file contain all name of patients want to be analyzed.
-r special the directory stored raw data
-d special the directory for storing annotated results
-b special the directory for link bam && bai files, store copynumber's txt each sample
-fmr special BGI-LH-EX794 is the index patient in family's analysis
-freq the frequence in different database(1000g, exac, gme, genomad) for filtering 
```

**PS**:

In here, We have several combination parameters:

```shell
"-v -m" #annotate variant and merge each sample
"-v -m -fmr index-sample" #annotate variant and compare family
"-c" #just call copynumber
"-c -v -m" #annotate, copynumber, merge
"-c -v -m -fmr index-sample" #annotate, copynumber, merge, family
"-m" #just merge
"-fmr index-sample" #just compare family
```

Please re write all steps in linux since the copy-paste from windows dose not work!

**If you want the program to run in the background**, and you can view the log files later, please according the command:

```shell
nohup /home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -c -v -m -in /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30 -fmr BGI-LH-EX794 -freq 0.01 &> /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst.log &
```

**View log files**

```shell
le /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst.log
```

The log file can be viewed, and check the status of the running (check keyboard input ENG)

**go to the end by shift + ","**

**and got to the top by shift + "."**

**you can write top to see the process of running** 

##### **If you forgot to add -fmr at first**, you can compare family after the running work finished, then run with the command:
```shell
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -i /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30 -fmr BGI-LH-EX794 -freq 0.01
```
After it finished, You can go to the directory `/home/luna/work/PIDsAnno/Patients.2019-10-30/Family`, and view the family compare result. Also can see the results in the windows directly, the path is `d:\datashared1\work\PIDsAnno\Patients.2019-10-30\Family`.

##### if you just want to annotate and call copy number, no family compare
please use the command like:
```shell
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -c -v -m -in /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30  -freq 0.01
```

##### if you just want to annotate, no family compare and copy number
please use the command like:
```shell
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -v -m -in /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30  -freq 0.01
```

##### if you just want to annotate and family compare, no copy number
please use the command like:
```shell
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -v -m -in /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30  -freq 0.01 -fmr BGI-LH-EX794
```

##### if you just want to merge some annoted samples
please use the command like:
```shell
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -m -in /home/luna/work/PIDsAnno/Patients.2019-10-30/id.lst -r /home/luna/work/RawData/Patients.2019-10-30 -d /home/luna/work/PIDsAnno/Patients.2019-10-30 -b /home/luna/work/BAMs/Patients.2019-10-30  -freq 0.01
```

#### Add new individual xls to big database
After finished analysis this batch work, we want to add the annotated sample to Big Databse, first we need to edit the Solved TAG file `/home/luna/work/PIDsAnno/Patients.2019-10-30/BigData/SamplesProcess.TAG.txt`, add TAG for each sample:
```shell
SampleID        Solved
EX105   U
EX778   S
EX789   S
EX210   S
EX211   S
EX213   S
EX248   S
EX284   S
EX342   S
EX804   U
......
EX73    U
EX18    U
EX19    C
EX20    C
EX21    C
```
**S means Solved**
**U means Unsolved**
**C means the controls for a family.** 

The file can write in your windows10 by “Notepad++”, one sample one line, separated by tabs or spaces; if you want to edit it in ubuntu, just use vim and so on editor.
The TAG file also can be edited at the path `d:\datashared1\work\PIDsAnno\BigData\SamplesProcess.TAG.txt` in windows system directly.
After editting the TAG file, we check the file `/home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX794_BGI-LH-EX803.batch.merge.lst`, Make sure that every file in the list exists and the file content is correct

```shell
cat /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX794_BGI-LH-EX803.batch.merge.lst
BGI-LH-EX794    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX794/BGI-LH-EX794.merge.txt.gz
BGI-LH-EX795    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX795/BGI-LH-EX795.merge.txt.gz
BGI-LH-EX796    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX796/BGI-LH-EX796.merge.txt.gz
BGI-LH-EX797    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX797/BGI-LH-EX797.merge.txt.gz
BGI-LH-EX798    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX798/BGI-LH-EX798.merge.txt.gz
BGI-LH-EX799    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX799/BGI-LH-EX799.merge.txt.gz
BGI-LH-EX800    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX800/BGI-LH-EX800.merge.txt.gz
BGI-LH-EX801    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX801/BGI-LH-EX801.merge.txt.gz
BGI-LH-EX802    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX802/BGI-LH-EX802.merge.txt.gz
BGI-LH-EX803    /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX803/BGI-LH-EX803.merge.txt.gz
```
**Then run the command:**
```shell
/home/luna/Desktop/Software/PIDsAnno/CombineSamp -i /home/luna/work/PIDsAnno/Patients.2019-10-30/BGI-LH-EX794_BGI-LH-EX803.batch.merge.lst
```
The Combine file can be found at `/home/luna/work/PIDsAnno/Patients.2019-10-30/BigData/Bigdatabse.CombineSamp.txt` in ubuntu and at `d:\datashared1\work\PIDsAnno\BigData\Bigdatabse.CombineSamp.xlsx` in system directly.

We need to set tag for samples after individual analysis:

`/home/luna/work/PIDsAnno/BigData/SamplesProcess.TAG.txt` is similar with `/home/luna/work/PIDsAnno/Patients.2019-10-30/BigData/SamplesProcess.TAG.txt`, each workshop has a BigData directory, all from `/home/luna/work/PIDsAnno/BigData/`, I just link `/home/luna/work/PIDsAnno/BigData/` to each workshop.

**Search specific gene and Print xls of specific gene:**

```shell
head -1  Bigdatabse.CombineSamp.txt > TPP1.frombigdata.txt
grep -w TPP1 Bigdatabse.CombineSamp.txt >> TPP1.frombigdata.txt
/home/luna/Desktop/Software/PIDsAnno/Tools/txt2xlsx -t TPP1.frombigdata.txt -x TPP1.frombigdata.xlsx
```
Then if you want to generate a xls for this gene, you just download the `.xls` file from linux to your computer by using the software “FileZilla”. And use excel to open it.

#### **Update new PID gene**
The file can write in your windows by “Notepad++”, one gene one line, separated by tabs or spaces; When you want to edit it in window system, please download it to your computer by using `filezilla`, then edit it, when finidhed, upload it to the directory `/home/luna/Desktop/Software/PIDsAnno/` by using `filezilla`, it finished.
the format is like as follow:
```shell
cat /home/luna/Desktop/Software/PIDsAnno/knowngene.txt
Gene    Inheritance_type
ACP5    AR
ACT1    AR
ACTB    AD
ADA2    AR
ADA     AR
ADAM17  AR
......
WIPF1   AR
WRAP53  AR
XIAP    XL
ZAP70   AR
ZBTB24  AR
ZIP7    AR
ZNF341  AR
```

#### **Update new blacklist gene**
The file can write in your windows by “EXCEL or NotePad++”, one gene one line, separated by tabs or spaces. If you use excel for dealing this step, after update you need to save as “Unicode txt”. The format is like as follow:
```shell
cat /home/luna/Desktop/Software/PIDsAnno/0.01_blacklist_full_HA.txt
Chr     Pos     Ref     Alt     Condensed # Patients    Individual # Patients   # Variants at Position  Total # Patients
17      43367998        G       A
1       173930928       G       C
3       187088958       C       T
18      57136795        C       T
1       92944314        CAGAGAGAGAG     C
......
12      104025446       G       A       44      44      1       3104
14      81329059        C       A       281     281     1       3104
15      33993320        G       T       1662    1       2       3104
15      33993320        G       A       1662    1661    2       3104
```

#### **How to start a test:**
In the directory of `/home/luna/work/PIDsAnno/Test`, there has a list: `id.test.lst`;

Enter the directory: `cd /home/luna/work/PIDsAnno/Test`
Then just run the command as following:
```shell
mkdir -p /home/luna/work/RawData/Test && cd /home/luna/work/RawData/Test
## copy the raw data of the list to the directory, this step can also be executed under windows. After finished, run
/home/luna/Desktop/Software/PIDsAnno/PIDsAnnoPipe -c -v -m –in /home/luna/work/PIDsAnno/Test/id.test.lst –d /home/luna/work/PIDsAnno/Test -r /home/luna/work/RawData/Test -b /home/luna/work/Bams/Test  –fmr BGI-LH-EX794 -freq 0.01
```
Just waiting for the script finished.
Then you can enter the directory `/home/luna/work/PIDsAnno/Test`, check the individual’s results and also can check the family's result.

Enter Familys, check the comparasion of family.
Enter CopyNumber, check the copy number of the batch.



#### If the bam file was splitted to chromosome bam files

Sometimes, the bam file of samples was splitted to chromosome separately, so if want to call copy number of all exons, there have two methods for solving this problem.

##### First, copy the bam files to the raw data directory, and rename it.

```shell
for i in {1..22} X Y M U;
do
	cp /ki/server/PID/path/of/sample/result_alignment/chr$i.bam /path/of/raw/data/sample.chr$i.bam
done
```

in this method, you don't need to merge them together, just copy and rename it, the Pipeline will recognition it auto and merge it to one bam file.

##### Second, just merge them to one bam file

```shell
sambamba merge -t 16 /path/of/raw/data/sample.bam /ki/server/PID/path/of/sample/result_alignment/chr{1..22}.bam /ki/server/PID/path/of/sample/result_alignment/chrM.bam /ki/server/PID/path/of/sample/result_alignment/chrX.bam /ki/server/PID/path/of/sample/result_alignment/chrY.bam
/ki/server/PID/path/of/sample/result_alignment/chrU.bam
```

## run HLA 

In here, I have test 3 tools for predict HLA, HLAreporter, OptiType, Polysolver

| Tools           | Paper               | PMID           | HLA type           | Data type            |
| --------------- | ------------------- | -------------- | ------------------ | -------------------- |
| **HLAreporter** | 2015 Genome Med     | PMID: 25908942 | HLA class I and II | Exon, Reseq, RNA-seq |
| **OptiType**    | 2014 Bioinformatics | PMID: 25143287 | HLA class I        | Exon, RNA-seq        |
| **POLYSOLVER**  | 2015 Nat Biotechnol | PMID: 26372948 | HLA class I        | Exon, Reseq          |



### HLAreporter
The script for run HLArepoter is:
`/home/luna/Desktop/Software/softHLA/HLAreporter.v103/HLAreporter`;



#### The usage of HLArepoter

```shell
/home/luna/Desktop/Software/softHLA/HLAreporter.v103/HLAreporter
HLAreporter version 1.03
Usage: command sample_name gene_name fq1 fq2 option
Gene: HLA_A HLA_B HLA_C HLA_DRB1 HLA_DRB3 HLA_DRB4 HLA_DRB5 HLA_DQB1 HLA_DPB1 HLA_DQA1
Please Enter the home directory of HLAreporter for running
option: G group member detection required, If you observe ambiguity, please use N : Y/y/Yes/yes/N/n/No/no
```
Above is the software's help file, but it just run for one gene one time, so I write a scripts for running all genes.
The path of this tools for running is:
`/home/luna/Desktop/Software/PIDsAnno/runHLArepoter`



#### The format of input

the input file is fastq file, uncompressed or cpmpressed.



#### run HLArepoter

Through this scripts, we can run for one gene or two genes or all genes:
```shell
cd /home/luna/work/HLA
```
##### run for all genes
```shell
/home/luna/Desktop/Software/PIDsAnno/runHLArepoter EX334 BGI-SE-LH-EX334_pe_1.fq.gz BGI-SE-LH-EX334_pe_2.fq.gz Y
```

##### run for one gene
```shell
/home/luna/Desktop/Software/PIDsAnno/runHLArepoter EX334 BGI-SE-LH-EX334_pe_1.fq.gz BGI-SE-LH-EX334_pe_2.fq.gz Y HLA_A
```

##### run for many genes, but no all genes
```shell
/home/luna/Desktop/Software/PIDsAnno/runHLArepoter EX334 BGI-SE-LH-EX334_pe_1.fq.gz BGI-SE-LH-EX334_pe_2.fq.gz Y HLA_A HLA_B HLA_DQB1
```

#### The results of HLAreporter
All results from HLAreporter saved in `/home/luna/work/HLA/EX334HLArepoter`;
```shell
cd /home/luna/work/HLA/EX334HLArepoter
## the name of results based on the samp and gene:
EX334_HLA_A_report.out
samp_gene_report.out
```



### OptiType

The script for run OptiType is:
`/home/luna/Desktop/Software/PIDsAnno/runOptiType`;



#### The usage of OptiType is:

```shell
Usage:
        perl ./runOptiType [options]
Options:
                -i <file> <in.input file>
                sampid  fastq1  fastq2
                -o <string> <the directory of out.output file>
                -t <string> <the type of sequencing data> <"DNA" "dna" or "RNA" "rna">
```


#### The format of input

The input file is fastq file, uncompressed or compressed.
but we need to get a list for fastq;
for example:
```shell
cat /home/luna/work/HLA/hla.lst
EX334   /home/luna/work/HLA/BGI-SE-LH-EX334_pe_1.fq.gz  /home/luna/work/HLA/BGI-SE-LH-EX334_pe_2.fq.gz
```
Just like `Sample	Fq1	Fq2`, In here, recommand use the absolute path for fastq file. After edit a list, we can run it.



#### run OptiType

The command for running OptiType:
```shell
cd /home/luna/work/HLA
/home/luna/Desktop/Software/PIDsAnno/runOptiType -i /home/luna/work/HLA/hla.lst -o /home/luna/work/HLA -t dna
```



#### The result of OptiType

All results from OptiType saved in
`/home/luna/work/HLA/EX334OptiType/`;

Two file used for analysed:
```shell
EX334_coverage_plot.pdf  EX334_result.tsv
## the name of results just based on the sample name
samp_coverage_plot.pdf  samp_result.tsv
```



### Polysolver

The script for running Polysolver is:
`/home/luna/Desktop/Software/PIDsAnno/runPolysolver`;



#### The usage of Polysolver:

```shell
Usage: ./runPolysolver bam race includeFreq build format insertCalc outDir
./runPolysolver /home/luna/Desktop/Software/softHLA/polysolver/test/test.bam Unknown 1 hg19 STDFQ 0 OutPolysolver
        bam: path to the BAM file to be used for HLA typing
        race: ethnicity of the individual (Caucasian, Black, Asian or Unknown)
        includeFreq: flag indicating whether population-level allele frequencies should be used as priors (0 or 1)
        build: reference genome used in the BAM file (hg18 or hg19)
        format: fastq format (STDFQ, ILMFQ, ILM1.8 or SLXFQ; see Novoalign documentation)
        insertCalc: flag indicating whether empirical insert size distribution should be used in the model (0 or 1)
        outDir: output directory
```



#### The format of input

The input file is bam file, which with index file `bam.bai or .bai`;



#### run Polysolver

The command for running Polysolver:
```shell
cd /home/luna/work/HLA
/home/luna/Desktop/Software/PIDsAnno/runPolysolver /home/luna/work/RawData/WholeExomeSequence/BGI-SE-LH-EX334.bam Unknown 1 hg19 STDFQ 0 /home/luna/work/HLA/EX334Poly
```



#### The result of Polysolver

All results from Polysolver saved in
`/home/luna/work/HLA/EX334Poly`;

There have many files, but just one file is useful, `winners.hla.txt`;
