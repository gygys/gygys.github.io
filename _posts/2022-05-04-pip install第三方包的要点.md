---
layout:     post
title:      pip install第三方包的要点
subtitle:   Python
date:       2022-05-04
author:     dulunar
header-img: img/post-bg-keybord.jpg
catalog: true
tags:
    - Python
    - pip    
    

---

## 前言
默认pip是使用Python官方的源，但是由于国外官方源经常被墙，导致不可用，我们可以使用国内的python镜像源，从而解决 Python 安装不上库的烦恼。

## 解决方法
关键命令：
```shell
pip install --user primer3-py -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
```
PS:  
-i http://mirrors.aliyun.com/pypi/simple/     表示将镜像地址切换为国内，这里切换到了豆瓣
--trusted-host mirrors.aliyun.com    表示将指定网站设置为信任服务器

常用的镜像地址：
```shell
1) http://mirrors.aliyun.com/pypi/simple/    阿里云
2) https://pypi.mirrors.ustc.edu.cn/simple/ 中国科技大学
3) http://pypi.douban.com/simple/    豆瓣
4) https://pypi.tuna.tsinghua.edu.cn/simple/   清华大学
5) http://pypi.mirrors.ustc.edu.cn/simple/ 中国科学技术大学
```

