---
layout:     post
title:      Ubuntu配置Fail2Ban防止SSH暴力破解与邮件预警
subtitle:    ubuntu, SSH, Fail2Ban
date:       2020-08-22
author:     dulunar
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Ubuntu
    - SSH
    - Fail2Ban
---

## 前言
今年以来，Ubuntu 14.04服务器一直被人使用SSH在进行暴力破解，甚至被进入系统，运行了挖矿和不知名的程序，所以还是需要配置一下防爆破措施，本来准备使用iptables来设置的，但是服务器用的人太多了，另外就是还有校外使用VPN的人在使用，通过搜索，发现Fail2Ban比较适合我们这种情况。

## Fail2Ban
Fail2Ban通过监视服务器的系统日志auth.log，然后匹配日志中的的错误信息（正则式匹配）而执行相应的屏蔽操作（一般情况下是防火墙），而且可以配置发送e-mail通知系统管理员进行预警！

Fail2Ban，防止暴力破解，工作原理是通过分析一定时间内的相关服务日志，将满足动作的相关IP利用iptables加入到drop（丢弃）列表一定时间。

Fail2Ban 为各种服务提供了许多过滤器，如 ssh、apache、nginx、squid、named、mysql、nagios 等。

Fail2Ban 官方网址：http://www.fail2ban.org , github网址: http://github.com/fail2ban/fail2ban

### 安装
本来想着源码安装的，但是发现有一键安装工具脚本，可以直接通过apt进行安装，所以就偷懒一下，工具的github地址：https://github.com/FunctionClub/Fail2ban,   功能齐全，支持 Centos 6/7 Ubuntu 14.04/16.10 Debian 7/8 (x86/x64)：
1. 自助修改SSH端口 （初始是22）
2. 自定义最高封禁IP的时间（以小时为单位）
3. 自定义SSH尝试连接次数 （2-10次）
4. 一键完成SSH防止暴力破解

安装需要使用root权限：
```shell
su 
wget https://raw.githubusercontent.com/FunctionClub/Fail2ban/master/fail2ban.sh
bash fail2ban.sh
```
1. 第一步选择是否修改SSH端口。
2. 第二步输入最多尝试输入SSH连接密码的次数。（2-10次）
3. 第三步输入每个恶意IP的封禁时间（Default:  24h）

选择好，等待安装脚本运行完：
```shell
 * Restarting authentication failure monitor fail2ban                                                                                                                [ OK ]
Finish Installing ! Reboot the sshd now !
ssh stop/waiting
ssh start/running, process 15018

Telegram Group: https://t.me/functionclub
Google Puls: https://plus.google.com/communities/113154644036958487268
Github: https://github.com/FunctionClub
QQ Group:277717865
Fail2ban is now runing on this server now!
```
安装完成后，如若出现ssh无法连接的情况，请返回安装log查看检查是否修改过ssh端口，使用修改后的ssh端口进行连接。

Fail2Ban的配置文件：/etc/fail2ban/
Fail2Ban的安装目录：/usr/share/fail2ban/
Fail2Ban日志文件：/var/log/fail2ban.log
达到阈值之后的执行Fail2Ban的动作的配置文件：/etc/fail2ban/action.d/ 
包含Fail2Ban所有的过滤规则：/etc/fail2ban/filter.d/

### 配置Fail2Ban
因为是一键安装和配置，所以这里介绍一下配置文件：/etc/fail2ban/jail.local
```shell
cat /etc/fail2ban/jail.local
#defalut这里是设定全局设置，如果下面的监控没有设置就以全局设置的值设置。
[DEFAULT]
ignoreip = 127.0.0.1 //用于指定哪些地址ip可以忽略 fail2ban 防御,以空格间隔
bantime = 86400 //客户端主机被禁止的时长（默认单位为秒）
maxretry = 5 //匹配到的密码输入次数阈值
findtime = 1800 //过滤的时长（秒）
destemail = user@seu.edu.cn //接收报警的邮件地址
sender = user@seu.edu.cn //发送者邮件地址
mta = mail //邮件发送软件
protocol = tcp

[ssh-iptables]
enabled = true //是否开启
filter = sshd //过滤规则
action = iptables[name=SSH, port=ssh, protocol=tcp] //动作
logpath = /var/log/auth.log //日志文件路径
maxretry = 5 //匹配到的密码输入次数阈值
findtime = 3600 //过滤的时长（秒）
bantime = 86400 //客户端主机被禁止的时长（默认单位为秒）
```

### 卸载
如若后面不想再使用Fail2Ban，可以脚本卸载：
```shell
su
wget https://raw.githubusercontent.com/FunctionClub/Fail2ban/master/uninstall.sh
bash uninstall.sh
```

### Fail2ban的命令

#### fail2ban-client
```shell
start	                	      启动fail2ban server和监狱
reload	                	    重新加载配置文件
stop	                	      暂停fail2ban和监狱
status	                	    查看运行的监控服务数量和列表
set loglevel	                设置日志等级，有 CRITICAL, ERROR, WARNING,NOTICE, INFO, DEBUG
get loglevel	                获取当前日志的等级
set <JAIL> idle on|off 	      设置某个监控（监狱）的状态。
set <JAIL> addignoreip <IP>   设置某个监控（监狱）可以忽略的ip
set <JAIL> delignoreip <IP>	  删除某个监控（监狱）可以忽略的ip
set <JAIL> banip <IP>	        将ip加入 监控（监狱）
set <JAIL> unbanip <IP>	      将ip从监控（监狱）移除
```

#### 删除禁止的IP
从 Fail2Ban 中删除禁止的 IP 地址，请运行以下命令：
```shell
fail2ban-client set ssh unbanip XXX.XXX.XXX.XXX
```

### Fail2Ban邮件预警
使用mail发送邮件，配置文件末尾添加发件人的信息。
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
```

往Fail2Ban的配置文件中添加邮箱设置：
```shell
cat /etc/fail2ban/jail.local
#defalut这里是设定全局设置，如果下面的监控没有设置就以全局设置的值设置。
[DEFAULT]
ignoreip = 127.0.0.1 //用于指定哪些地址ip可以忽略 fail2ban 防御,以空格间隔
bantime = 86400 //客户端主机被禁止的时长（默认单位为秒）
maxretry = 5 //匹配到的密码输入次数阈值
findtime = 1800 //过滤的时长（秒）
destemail = u1@seu.edu.cn //接收报警的邮件地址
sender = u2@seu.edu.cn //发送者邮件地址
mta = mail //邮件发送软件
protocol = tcp

[ssh-iptables]
enabled = true //是否开启
filter = sshd //过滤规则
action = iptables[name=SSH, port=ssh, protocol=tcp] //动作
## action = mail[name=SSH, dest=u1@seu.edu.cn]
mail-whois[name=SSH, dest=u1@seu.edu.cn, sender=u2@seu.edu.cn] //邮件发送
logpath = /var/log/auth.log //日志文件路径
maxretry = 5 //匹配到的密码输入次数阈值
findtime = 3600 //过滤的时长（秒）
bantime = 86400 //客户端主机被禁止的时长（默认单位为秒）
```

配置文件中的mail-whois在目录`/etc/fail2ban/action.d/`的`mail-whois.conf`，配置如下：
```shell
vi /etc/fail2ban/action.d/mail-whois.conf
# Fail2Ban configuration file
#
# Author: Cyril Jaquier
#
#

[Definition]

# Option:  actionstart
# Notes.:  command executed once at the start of Fail2Ban.
# Values:  CMD
#
actionstart = printf %%b "Hi,\n
              The jail <name> has been started successfully.\n
              Regards,\n
              Fail2Ban"|mail -s "[Fail2Ban] <name>: started on `uname -n`" <dest>

# Option:  actionstop
# Notes.:  command executed once at the end of Fail2Ban
# Values:  CMD
#
actionstop = printf %%b "Hi,\n
             The jail <name> has been stopped.\n
             Regards,\n
             Fail2Ban"|mail -s "[Fail2Ban] <name>: stopped on `uname -n`" <dest>

# Option:  actioncheck
# Notes.:  command executed once before each actionban command
# Values:  CMD
#
actioncheck =

# Option:  actionban
# Notes.:  command executed when banning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    See jail.conf(5) man page
# Values:  CMD
#
actionban = printf %%b "Hi,\n
            The IP <ip> has just been banned by Fail2Ban after
            <failures> attempts against <name>.\n\n
            Here are more information about <ip>:\n
            `whois <ip>`\n
            `/bin/curl http://ip.taobao.com/service/getIpInfo.php?ip=<ip>`\n\n
            Regards,\n
            Fail2Ban"|mail -s "[Fail2Ban] <name>: banned <ip> from `uname -n`" <dest>

# Option:  actionunban
# Notes.:  command executed when unbanning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    See jail.conf(5) man page
# Values:  CMD
#
actionunban =

[Init]

# Default name of the chain
#
name = default

# Destination/Addressee of the mail
#
dest = root
```

通过curl http://ip.taobao.com/service/getIpInfo.php?ip=<ip>淘宝的IP查询获取攻击者的一些IP信息。

然后重新载入修改的配置：
```shell
sudo fail2ban-client reload
```

## 参考
[配置mail使用SMTP发送邮件][1]
[Centos7安装Fail2Ban并利用163邮箱发送邮件提醒功能][2]
[fail2ban的使用以及防暴力破解与邮件预警][3]

[1]: https://juejin.im/post/6844903615644057608
[2]: https://www.58jb.com/html/centos7_fail2ban.html
[3]: https://www.cnblogs.com/operationhome/p/9184580.html


									—— dulunar 后记于 2020.08




