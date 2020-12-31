---
layout:     post
title:      Ubuntu安装和使用Speedtest-cl
subtitle:   Ubuntu, Speedtest-cl
date:       2020-12-27
author:     dulunar
header-img: img/post-bg-desk.jpg
catalog: true
tags:
    - Ubuntu
    - Python

---

## Speedtest-cli

Speedtest-cli是用Python写的脚本语言，主要用来测试互联网网速，可以测试网速到km单位，也可以正对每个服务器的网速进行测试，还可以测试某个url链接的网速。

## Ubuntu安装

推荐使用Python 3.7 的pip3安装

```shell
$ pip install --user speedtest-cli
Collecting speedtest-cli
  Using cached speedtest_cli-2.1.2-py2.py3-none-any.whl (19 kB)
Installing collected packages: speedtest-cli
Successfully installed speedtest-cli-2.1.2
```

## 运行测试网速

```shell
$ speedtest-cli
Retrieving speedtest.net configuration...
Cannot retrieve speedtest configuration
ERROR: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1091)>
```

此处运行speedtest-cli出现错误，原因是无法获得本地的SSL证书。

### 解决方法

#### 查看默认证书的位置

```shell
$ python3
Python 3.7.9 (default, Nov 24 2020, 12:37:13)
[GCC 5.5.0 20171010] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import ssl
>>> print(ssl.get_default_verify_paths())
# 执行结果
DefaultVerifyPaths(cafile=None, capath='/usr/local/ssl/certs', openssl_cafile_env='SSL_CERT_FILE', openssl_cafile='/usr/local/ssl/cert.pem', openssl_capath_env='SSL_CERT_DIR', openssl_capath='/usr/local/ssl/certs')
```

进入默认位置查看，发现没有`cert.pem`文件。通过在`/usr/`目录下查找`cert.pem`文件：

```shell
$ find /usr -type f -name "cert.pem"
/usr/share/doc/libssl-doc/demos/sign/cert.pem
/usr/share/doc/libssl-doc/demos/easy_tls/cert.pem
# 或者使用find2perl
$ find2perl /usr -type f -name "cert.pem" > find.pl
$ perl find.pl
/usr/share/doc/libssl-doc/demos/sign/cert.pem
/usr/share/doc/libssl-doc/demos/easy_tls/cert.pem
```

查找到的文件都是demos下的文件，通过查看其大小和构建时间，发现不符合现在的要求，需要重新下载。

#### 下载CA文件

```shell
$ wget http://curl.haxx.se/ca/cacert.pem
$ sudo mv cacert.pem /usr/local/ssl/certs/cert.pem
$ sudo ln -s /usr/local/ssl/certs/cert.pem /usr/local/ssl/cert.pem
```

#### 再运行

```shell
$ speedtest-cli
Retrieving speedtest.net configuration...
Testing from China Education and Research Network Center (121.249.15.249)...
Retrieving speedtest.net server list...
Selecting best server based on ping...
Hosted by 安徽移动5G-HN (HuaiNai) [0.43 km]: 213.849 ms
Testing download speed................................................................................
Download: 93.54 Mbit/s
Testing upload speed......................................................................................................
Upload: 95.09 Mbit/s
```

没有报错，完美运行。

## References

[Ubuntu上安装并使用speedtest-cli测试网速](http://www.linuxdown.net/install/soft/2016/0226/4830.html)

[Python打开https链接报错：unable to get local issuer certificate][1]

[1]: https://www.jianshu.com/p/ef9c6173f20a




							—— dulunar 后记于 2020.12