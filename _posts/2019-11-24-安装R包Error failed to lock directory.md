---
layout:     post
title:      安装R包Error failed to lock directory
subtitle:    R install.packages
date:       2019-11-24
author:     dulunar
header-img: img/post-bg-seus.jpg
catalog: true
tags:
    - Ubuntu
    - R
---

## 报错
命令行安装R包的时候出现了如下错误:
```shell
install.packages("Rcpp")
## 报错信息的后面是这样的
ERROR: failed to create lock directory '/home/luna/Rsoft/lib64/library/00LOCK-Rcpp'
```

## 解决方案
在NFS文件系统上，有时必须关闭哪些内容并不明显。但是在R的控制台中，可以使用以下命令在命令中执行此操作：
```shell
install.packages("Rcpp", INSTALL_opt=c('--no-lock'))
```

或者直接在ubuntu命令行中加入`--no-lock`:
```shell
R CMD INSTALL --no-lock Rcpp
```

但是我还碰到过一次，是因为上一个软件包安装异常中断，然后安装其他的软件，也报了错误，解决此问题，就是删除锁定的文件。例如，在R控制台中执行以下命令：
```shell
unlink("/home/luna/Rsoft/lib64/library/00LOCK-Rcpp", recursive = TRUE)
```

这个命令也有效，上面的三个我都用过了，唉！

## 参考
[stackoverflow][1]

[1]: https://stackoverflow.com/questions/14382209/r-install-packages-returns-failed-to-create-lock-directory


									—— dulunar 后记于 2019.11