---
layout:     post
title:      解决apt过程中Could not get lock
subtitle:    apt install
date:       2019-11-25
author:     dulunar
header-img: img/post-bg-seus.jpg
catalog: true
tags:
    - Ubuntu
    - apt
---

## 报错
`ubuntu`命令行下面想使用`apt`安装软件，碰到如下错误:
```shell
sudo apt install -y chrpath
## 报错信息的后面是这样的
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following NEW packages will be installed:
  chrpath
0 upgraded, 1 newly installed, 0 to remove and 534 not upgraded.
E: Could not get lock /var/cache/apt/archives/lock - open (11: Resource temporarily unavailable)
E: Unable to lock directory /var/cache/apt/archives/
```

## 解决方案
这个报错的原因是，因为有另外一个进程在使用这个目录：`/var/cache/apt/archives/`，所以先确定是否还有其他人在使用软件管理程序或者在使用`apt`进行软件的安装，如果没有的话，可以直接删除/重命名：
```
sudo rm /var/cache/apt/archives/lock

# or
sudo mv /var/cache/apt/archives/lock /var/cache/apt/archives/lock_bak

# Then
sudo apt-get update
```

然后`apt-get`就恢复正常了，正常安装软件。

## 参考
[Fix E: Could not get lock][1]

[1]: https://itsfoss.com/fix-ubuntu-install-error/


									—— dulunar 后记于 2019.11