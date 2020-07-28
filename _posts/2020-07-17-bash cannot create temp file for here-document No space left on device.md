---
layout:     post
title:      bash cannot create temp file for here-document No space left on device
subtitle:    ubuntu, storage
date:       2020-07-17
author:     dulunar
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Ubuntu
    - File system
---


# bash cannot create temp file for here-document No space left on device

在Ubuntu下想使用Tab键进行文件的自动补全，出现错误代码：
```shell
-bash: cannot create temp file for here-document: No space left on device
```

## 查找原因
出现这个报错的根本原因是磁盘满了，可以使用`df -h`进行查看：
```shell
df -h
# 显示的结果
Filesystem                       Size  Used Avail Use% Mounted on
udev                              63G  4.0K   63G   1% /dev
tmpfs                             13G  1.7M   13G   1% /run
/dev/sda1                         76G   76G     0 100% /
none                             4.0K     0  4.0K   0% /sys/fs/cgroup
none                             5.0M     0  5.0M   0% /run/lock
none                              63G  292K   63G   1% /run/shm
none                             100M   24K  100M   1% /run/user
/dev/sdb1                        4.4T  3.9T  217G  95% /home
192.168.100.100:/volume1/nasseu   21T   20T  1.9T  92% /mainsd
```
从显示结果可以发现`/dev/sda1`对应的根目录已经100%的使用了，需要对该目录进行文件清理。

于是进入根目录`cd /`使用`sudo du -h --max-depth=1`进行目录大小的评估：
```shell
cd /
sudo du -h --max-depth=1
# 查询结果
537M    ./lib
0       ./sys
654M    ./root
28K     ./media
24M     ./etc
358M    ./lost+found
12M     ./bin
4.0K    ./lib64
20T     ./mainsd
4.0K    ./cdrom
26G     ./usr
48G     ./var
13M     ./sbin
3.9T    ./home
0       ./proc
4.0K    ./dev
112M    ./opt
65M     ./boot
4.0K    ./srv
5.8M    ./tmp
4.0K    ./mnt
2.0M    ./run
24T     .
```
我们发现`/var`这个目录居然到了48G的存储，该目录下都是日志文件，应该是出现了某些错误的日志文件，一直进行错误输出到文件，于是到该目录下搜索100Mb以上的文件列表：
```shell
sudo find /var -size +100M -print | xargs ls -lh
# 结果显示如下
-rw-rw---- 1 messagebus messagebus 346M May 19  2018 /var/lib/docker/aufs/diff/27187d89247b824338a1b627afa33d89778bec02e60daaa468dab30df9bf70d8/var/lib/mysql/ibdata1
-rw-r--r-- 1 root       root       130M Nov 12  2017 /var/lib/docker/aufs/diff/4d62beb5a21f55d6b550e940ec5b99301e1684d1c2dc3fb7394616d75ac8fbce/opt/conda/pkgs/mkl-2017.0.3-0.tar.bz2
-rw-r--r-- 1 root       root       112M Feb 23  2018 /var/lib/docker/aufs/diff/af466915e296837f4083dbc7ace8f16aa88ace9f5556c0ce76da7c8c61215c5f/tmp/setting/dump_hg19.sql
-rw-r----- 1 root       mlocate    353M Jul 15 08:10 /var/lib/mlocate/mlocate.db
-rw-r----- 1 root       adm         44G Jul 17 14:04 /var/log/cups/error_log
```
从文件大小的遍历可以发现`/var/log/cups/error_log`该文件的大小有错，查看文件内容：
```shell
sudo head /var/log/cups/error_log
# 结果显示
W [17/Jul/2020:11:23:52 +0800] Notifier for subscription 75 (dbus://) went away, retrying!
E [17/Jul/2020:11:23:52 +0800] File "/usr/lib/cups/notifier/dbus" not available: No such file or directory
W [17/Jul/2020:11:23:52 +0800] Notifier for subscription 75 (dbus://) went away, retrying!
E [17/Jul/2020:11:23:52 +0800] File "/usr/lib/cups/notifier/dbus" not available: No such file or directory
W [17/Jul/2020:11:23:52 +0800] Notifier for subscription 75 (dbus://) went away, retrying!
E [17/Jul/2020:11:23:52 +0800] File "/usr/lib/cups/notifier/dbus" not available: No such file or directory
W [17/Jul/2020:11:23:52 +0800] Notifier for subscription 75 (dbus://) went away, retrying!
E [17/Jul/2020:11:23:52 +0800] File "/usr/lib/cups/notifier/dbus" not available: No such file or directory
W [17/Jul/2020:11:23:52 +0800] Notifier for subscription 75 (dbus://) went away, retrying!
```
可以发现该错误文件的位置和内容都指向了`cpus`相关的命令，于是使用`top`或者`ps aux | grep cups`查看：
```shell
top
# 显示结果
PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
3498 root      20   0   76868   3680   2648 R 100.0  0.0 941:31.97 /usr/sbin/cupsd -f
```
到此，问题找到了，接下来进行处理。

## 解决方法
首先关闭正在运行的`cupsd`进程，然后删除生成的错误日志文件，停掉`cpus`服务，把和`cpus`相关的配置文件和目录进行备份转移，重启`cpus`：
```shell
sudo kill -9 3498
sudo rm -rf /var/log/cups/error_log
sudo service cups stop
sudo ls /etc/cups/subscriptions.conf* | xargs -t -i mv {} {}.bak
sudo mv /var/cache/cups /var/cache/cups.bak
sudo service cups start
# sudo chmod 000 /usr/sbin/cupsd 该步骤完全禁止cupsd进行执行选项
```

这里需要注意下，删除完错误日志后，使用`df -h`不会立刻发现存储空间恢复过来了，过一段时间才能看到，但是使用TAB进行自动补全已经没有问题了。