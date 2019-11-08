---
layout:     post
title:      Perl Library getopts.pl
subtitle:    Perl Library
date:       2019-11-08
author:     dulunar
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Ubuntu
    - Perl
    - cpanm
---


## 错误来源
在运行`HLAreporter.v103`的时候碰到一些问题，其中之一是缺少perl的一个脚本`getopts.pl`:
```shell
Can't locate getopts.pl in @INC (@INC contains: /home/luna/perl5/lib/perl5/5.26.1/x86_64-linux-gnu-thread-multi /home/luna/perl5/lib/perl5/5.26.1 /home/luna/perl5/lib/perl5/x86_64-linux-gnu-thread-multi /home/luna/perl5/lib/perl5 /home/luna/perl5/lib/perl5/x86_64-linux-gnu-thread-multi /home/luna/Desktop/Software/ensembl-vep /home/luna/Desktop/Software/ensembl-vep-97/ensembl-vep /home/luna/perl5/lib/perl5/5.26.1/x86_64-linux-gnu-thread-multi /home/luna/perl5/lib/perl5/5.26.1 /home/luna/perl5/lib/perl5/x86_64-linux-gnu-thread-multi /home/luna/perl5/lib/perl5 /home/luna/perl5/lib/perl5/lib/perl5/x86_64-linux-gnu-thread-multi /usr/local/lib/x86_64-linux-gnu/perl/5.26.1 /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.26.1 /usr/local/share/perl/5.26.1 /usr/lib/x86_64-linux-gnu/perl5/5.26 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl/5.26 /usr/share/perl/5.26 /home/luna/perl5/lib/perl5/5.26.0 /home/luna/perl5/lib/perl5/5.26.0/x86_64-linux-gnu-thread-multi /home/luna/perl5/lib/perl5/5.26.0 /home/luna/perl5/lib/perl5/5.26.0/x86_64-linux-gnu-thread-multi /usr/local/lib/site_perl /usr/lib/x86_64-linux-gnu/perl-base) at ../ssake_v3-8-tar/ssake_v3-8/SSAKE line 52.
```
粗一看觉得这个程序不是和`module Getopt::Long`是一样的么，我的`perl`中`use Getopt::Long;`用的好好的怎么会出现这个问题，没搞清楚；

后来查了一下这个`getopts.pl`的程序，发现了一句话：
```markdown
getopts.pl is a Perl 4 core library but no longer included in current Perl 5 distributions.
```

## 解决方案
找到了问题，就比较简单的可以解决了，以前安装`perl`的`module`一直用的`perl -MCPAN -e shell`，幸好自己有`root`的权限，这一次想着全部安装在自己的目录下面，所以安装了一下`cpanm`这个`perl`安装`module`的程序：
```shell
curl -L http://cpanmin.us | perl - -l ~/perl5 App::cpanminus local::lib
echo 'eval `perl -I ~/perl5/lib/perl5 -Mlocal::lib`' >> ~/.bashrc && cp ~/.bashrc ~/.bash_profile
. ~/.bashrc
```
安装和配置好以后，就可以方便的安装`perl module`:
```shell
cpanm -v --notest -l /home/luna/perl5 Perl4::CoreLibs
```

## 参考
[Linux上安装Perl模块的两种方法][1]
[使用 cpanm 安装 Perl 模块][2]
[perl library getopts.pl][3]
[Perl4::CoreLibs][4]

[1](https://www.cnblogs.com/zhangchaoyang/articles/2610573.html)
[2](http://www.voidcn.com/article/p-bqegompd-ee.html)
[3](https://unix.stackexchange.com/questions/224716/perl-library-getopts-pl)
[4](https://metacpan.org/pod/release/ZEFRAM/Perl4-CoreLibs-0.003/lib/Perl4/CoreLibs.pm)

									—— dulunar 后记于 2019.11