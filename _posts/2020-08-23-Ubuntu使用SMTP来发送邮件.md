---
layout:     post
title:      Ubuntu使用SMTP来发送邮件
subtitle:    ubuntu, mail
date:       2020-08-23
author:     dulunar
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Ubuntu
    - smtp
---

## 前言
这段时间因为`Ubuntu 14.04` 服务器一直被爆破登录，所以在服务器上设置了`Fail2Ban`，`Fail2Ban`进行预警并发送邮件进行提示，所以需要对`mail`进行设置。

## 安装`mailx`
刚开始想着直接安装`mailx`，可是却遇到出错：
```shell
sudo apt install mailx
```
err:
```shell
Reading package lists... Done
Building dependency tree
Reading state information... Done
Package mailx is a virtual package provided by:
  mailutils 1:2.99.98-1.1
  heirloom-mailx 12.5-2+deb7u1build0.14.04.1
  bsd-mailx 8.1.2-0.20131005cvs-1ubuntu0.14.04.1
You should explicitly select one to install.

E: Package 'mailx' has no installation candidate
```

按照提示选择第二个进行安装：
```shell
sudo apt install heirloom-mailx
```

顺利安装好软件。

## 测试发送邮件
软件安装好以后，首先发送邮件进行一下测试：
```shell
echo "send mail test" | mail user@qq.com
```
但是出现了问题：
```shell
send-mail: Authorization failed (535 Error: authentication failed)
```

表明验证出错，`mailx`配置文件没有设置发送账号和帐号密码等，找到`mailx`配置文件进行添加修改；

`Ubuntu`系统中的配置文件位于`/etc/nail.rc`，其他的系统可能位于`/etc/s-nail.rc`或者`/etc/mail.rc`;
往`nail.rc`中添加下列内容：

```shell
sudo vi /etc/nail.rc

## Add sendmail settings
set from=USER@seu.edu.cn //发信人邮箱
set smtp=smtps://smtp.seu.edu.cn:465 //发信人邮箱的SMTP地址
set smtp-auth-user=USER@seu.edu.cn //发信人邮箱登陆账号
set smtp-auth-password=PASSWORD //发信人邮箱的密码
set smtp-auth=login     //认证方式
set ssl-verify=ignore //忽略证书警告
set nss-config-dir=/etc/pki/nssdb //证书所在目录
#set smtp-use-starttls=yes  //STARTTLS时使用

```
在这里需要注意：

```vim
1. smtp的端口设置，如果使用465，则需要加上smtps://协议；当使用587端口的时候，不需要写smtps://或者写成smtp://；
2. 当使用587端口时，应当设置smtp-use-starttls=yes;
3. 邮件的来源应当与邮箱相同，或者将发信人姓名写在邮箱后的括号中。例如：set from=user@xxxx.com或set from=user@xxx.com(sender)；如果邮箱与认证的不一致，将出现“smtp-server: 553 Mail from must equal authorized user”的错误；
4. 有些邮件服务器的587端口不是使用STARTTLS而是SMTPS，此时仍需加上smtps://协议，例如126邮箱。
```

添加后，保存该次修改，重新测试：

```shell
echo "send mail test" | mail user@qq.com

echo "send mail test" | mail -s '邮件标题' user@qq.com

cat mail-test.txt | mail -s 'mail subject' user@qq.com

mail -s 'mail subject' user@qq.com < mail-test.txt
```
这里的`user@qq.com`是收件人邮箱，到邮箱去接收测试邮件，成功。

## 多账户
一般邮箱有多个，那么如何切换发送邮箱呢？在`mailx`个人配置文件中使用`account`指令进行配置，首先建立一个文件`~/.mailrc`，再配置：
```shell
touch ~/.mailrc
vi ~/.mailrc
account seu {
        set from=user@seu.edu.cn //发信人邮箱
        set smtp=smtps://smtp.seu.edu.cn:465 //发信人邮箱的SMTP地址
        set smtp-auth-user=user@seu.edu.cn //发信人邮箱登陆账号
        set smtp-auth-password=password //发信人邮箱密码
        set smtp-auth=login     //认证方式
        set ssl-verify=ignore //忽略证书警告
        set nss-config-dir=/etc/pki/nssdb //证书所在目录
}

## QQ邮箱支持STARTTLS（未成功）
account qq {
        set from=user@qq.com //发信人邮箱
        set smtp=smtps://smtp.qq.com:465 //发信人邮箱的SMTP地址
        set smtp-auth-user=user@qq.com //发信人邮箱登陆账号
        set smtp-auth-password=AuthorCode  //qq提供的授权码/密码
        set smtp-auth=login     //认证方式
        set ssl-verify=ignore //忽略证书警告
        set nss-config-dir=/etc/pki/nssdb //证书所在目录
}

## QQ邮箱可以使用587端口
account qq {
        set from=user@qq.com //发信人邮箱
        set smtp=smtp://smtp.qq.com:587 //发信人邮箱的SMTP地址
        set smtp-auth-user=user@qq.com //发信人邮箱登陆账号
        set smtp-auth-password=AuthorCode  //qq提供的授权码/密码
        set smtp-auth=login     //认证方式
        set ssl-verify=ignore //忽略证书警告
        set nss-config-dir=/etc/pki/nssdb //证书所在目录
}
```

个人邮箱配置文件中定义了两个账户`seu`和`qq`，发送邮件时可用-A参数指定发信账户：
```shell
echo "qq test" | mail -A qq -s 'qq mail test' nlu@seu.edu.cn
echo "seu test" | mail -A seu -s 'seu mail test' nlu@seu.edu.cn
```

当然除了配置文件，也可以在命令行中使用`-S`参数进行设置，如下：
```shell
echo 'mail test for command line option' | mail -s 'qq mail test' -S smtp=smtps://smtp.qq.com:465 -S smtp-auth=login -S smtp-auth-user=user@qq.com -S smtp-auth-password=AuthorCode -S ssl-verify=ignore -S nss-config-dir=/etc/pki/nssdb -S from="user@qq.com(nlu qq)" nlu@seu.edu.cn

# or

echo 'mail test for command line option' | mail -s 'qq mail test' -S smtp=smtp://smtp.qq.com:587 -S smtp-auth=login -S smtp-auth-user=user@qq.com -S smtp-auth-password=password -S ssl-verify=ignore -S nss-config-dir=/etc/pki/nssdb -S from="user@qq.com(nlu qq)" nlu@seu.edu.cn
```
命令行这种方法比较繁琐，其实就是将配置文件的每一行都作为选项写在命令中，当有需求在程序中调用mail命令发送邮件时可以采取这种方法。

现在就可以正常的使用`mail smtp`发送邮件了。

## 参考
[配置mail使用SMTP发送邮件][1]

[1]: https://juejin.im/post/6844903615644057608

									—— dulunar 后记于 2020.08




