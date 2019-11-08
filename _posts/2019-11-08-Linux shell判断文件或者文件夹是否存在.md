---
layout:     post
title:      Linux shell判断文件或文件夹是否存在
subtitle:    Linux Shell
date:       2019-11-08
author:     dulunar
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Ubuntu
    - shell
---

## 前言
在写流程的时候，需要针对文件进行一下操作，一般在`shell`中会先对其进行判断；

## 代码
```shell
#shell判断文件夹是否存在
file=/path/of/file/aaaa
folder=/path/of/folder
#如果文件夹不存在，创建文件夹
if [ ! -d "$folder" ]; then
  mkdir -p $folder
fi

#shell判断文件,目录是否存在或者具有权限

# -x 参数判断 $folder 是否存在并且是否具有可执行权限
if [ ! -x "$folder"]; then
  mkdir "$folder"
fi

# -d 参数判断 $folder 是否存在
if [ ! -d "$folder"]; then
  mkdir "$folder"
fi

# -f 参数判断 $file 是否存在
if [ ! -f "$file" ]; then
  touch "$file"
fi

# -n 判断一个变量是否有值
if [ ! -n "$var" ]; then
  echo "$var is empty"
  exit 0
fi

# 判断两个变量是否相等
if [[ "$var1" = "$var2" || "$var1" == "$var2" ]]; then
  echo '$var1 eq $var2'
else
  echo '$var1 not eq $var2'
fi
```

									—— dulunar 后记于 2019.11