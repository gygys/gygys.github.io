---
layout:     post
title:      安装R包出现load failed错误
subtitle:    R install.packages
date:       2019-11-21
author:     dulunar
header-img: img/post-bg-seus.jpg
catalog: true
tags:
    - Ubuntu
    - R
---

## 前言
最近刚回来，发现实验室服务器各种bug，首先apt升级了一些软件，然后老版本的R 3.3.1升级到了3.6.1，于是乎出现以前安装的包不能在当前版本用
```shell
package ‘scales’ was installed by an R version with different internals; it needs to be reinstalled for use with this R version
```
于是跟着更新了一下：
```R
update.packages(checkBuilt=TRUE, ask=FALSE)
```
大部分都正常了，但是还是有些包没法使用，只能再重新安装了：
```R
install.packages("tidyverse", clean=TRUE, dependencies=TRUE)
```
可是在安装某些R包的过程中还是出现了一些错误，例如：
```shell
Error: package or namespace load failed for ‘haven’ in dyn.load(file, DLLpath = DLLpath, ...):
 unable to load shared object '/home/luna/Desktop/Software/R-3.2.5/lib64/R/library/00LOCK-haven/00new/haven/libs/haven.so':
  /home/luna/Desktop/Software/R-3.2.5/lib64/R/library/00LOCK-haven/00new/haven/libs/haven.so: undefined symbol: libiconv
Error: loading failed
Execution halted
ERROR: loading failed
removing ‘/home/luna/Desktop/Software/R-3.2.5/lib64/R/library/haven’

Error: package or namespace load failed for ‘readx1’ in dyn.load(file, DLLpath = DLLpath, ...):
Error: package or namespace load failed for ‘ tidyverse’ in dyn.load(file, DLLpath = DLLpath, ...):
```

## 解决
其实错误的根本是在R中安装包的时候调用了系统安装的非R的动态库，在本地lib路径( 不是 R 软件包) 中有 libiconv.so，包含在 LD_LIBRARY_PATH 中，在 R 会话中验证也可以发现
```R
Sys.getenv("LD_LIBRARY_PATH")
```
具有该目录。但是R 库加载程序时无法找到这里共享对象，所以这个错误就是R包的非R依赖项的问题。

### 清洗器解决方法
使用`withr::with_makevars`，这个方法允许临时控制`Makevars`内容，使用这个方式，可以直接从`repo`安装R包：
```shell
withr::with_makevars(c(PKG_LIBS = "-liconv"), install.packages("haven"), assignment = "+=")

## or

with_makevars(c(PKG_CFLAGS = "-std=c11"), install.packages("plyr", repos = NULL, type = "source"), assignment = "+=")
```
要使用这个方法，只需要已经安装了`withr`，这个是`devtools`的依赖使用。

## 参考

[dynamic-loading - 如何在 R 中指定动态库加载的( 非 R ) 库路径？][2]

[如何使用选项-std = c99来安装R包][1]

[with_makevars][3]

[1]: https://www.soinside.com/question/yoS3cARfsq5zRHMUxXMBNe

[2]: https://ask.helplib.com/others/post_13735715

[3]: https://www.rdocumentation.org/packages/withr/versions/2.1.1/topics/with_makevars

									—— dulunar 后记于 2019.11