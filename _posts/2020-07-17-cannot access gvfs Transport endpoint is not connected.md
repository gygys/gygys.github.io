---
layout:     post
title:      cannot access gvfs Transport endpoint is not connected
subtitle:    ubuntu, storage
date:       2020-07-17
author:     dulunar
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Ubuntu
    - File system
---


# cannot access gvfs Transport endpoint is not connected

近期因为ubuntu服务器出现进不了系统的故障，在修复完以后，进入系统，输入命令：
```shell
df -h
#出现如下错误
df: ‘/run/user/1001/gvfs’: Transport endpoint is not connected
Filesystem                       Size  Used Avail Use% Mounted on
udev                              63G  4.0K   63G   1% /dev
tmpfs                             13G  1.7M   13G   1% /run
/dev/sda1                         76G   33G   40G  46% /
none                             4.0K     0  4.0K   0% /sys/fs/cgroup
none                             5.0M     0  5.0M   0% /run/lock
none                              63G  292K   63G   1% /run/shm
none                             100M   24K  100M   1% /run/user
/dev/sdb1                        4.4T  3.9T  217G  95% /home
192.168.100.100:/volume1/nasseu   21T   20T  1.9T  92% /mainsd
```
使用`ls`进行文件查看：
```shell
ls /run/user/1001/gvfs
# 仍然会出现错误
ls: cannot access /run/user/1001/gvfs: Transport endpoint is not connected
```
## 解决办法
该问题是挂载出现了故障，所以可以通过卸载和创新安装挂载点进行修复。首先需要root权限，然后操作如下：
```shell
su
cd /run/user/1001/
fusermount -zu gvfs
```

接下来重新运行`df -h`或者`ls /run/user/1001/gvfs`，都是正常显示了，现在看问题解决了。


