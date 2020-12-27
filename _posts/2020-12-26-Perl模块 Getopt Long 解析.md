---
layout:     post
title:      Perl模块 Getopt::Long 解析
subtitle:   Perl
date:       2020-12-26
author:     dulunar
header-img: img/post-bg-desk.jpg
catalog: true
tags:
    - Perl
---

## Getopt::Long模块
Getopt::Long模块是用于解析命令行参数的Perl模块:
```perl
## option variables with default value
my $verbose = "";
my $nda = "";
my $more = 0;
my $value = "";
my @libs = ();
my %defines = ();

## parse options from @ARGV
GetOptions(
    'v|verbose' => \$verbose,
    'nda!' => \$nda,
    'more+' => \$more, 
    't|tag=s' => \$tag,
    'value:s' => \$value,
    'b|libs=i' => \@libs, ## 'libs=i@' => \$libs,
    'define=s' => \%defines, ## 'define=s%' => \$defines,
    'set'	=>	\&handle,
) or die $!;

my $verbose = "";

sub handle {
    $verbose = 100;
    print "options \'--set\' set verbose $verbose\n";
}
```

## 选项解析
1. `verbose`，只有单独的一个选项，不接受任何参数。在命令行用`--verbose|-v`来触发，触发后`$verbose`被设置为1，次用法常作为一个开关选项使用，此处使用了多命名方式，`--verbose`和`-v`是一样的。
2. `nda!`，该选项在nda后加一个`!`，表示可以接受--nda和--nonda两个选项，对应的将$nda设置为1和0，如果触发该选项，$nda值为""（即空值），可以用perl内置函数length检测$nda。
3. `more+`该选项的`+`表示在参数列表每出现一次--more，对应的变量$more自加1。
4. `tag=s`该选项必须接受一个string参数，`=` 表明必须要接受一个参数，`s` 表明参数为任意字符串，也可用`i`或`f`指明参数为整数或浮点数。
5. `value:s`与`tag=s`的唯一区别是`:` 表明不是必须接受一个参数，可以--value形式调用，`s`默认赋值为""，`i`/`f`默认赋值为0。
6. `libs=i`指定一个数组引用`@libs`，表明可以多次使用"--libs <lib>" 或者 "-b <lib>" 获取多个值并存到数组中，也可以使用另一种形式` 'libs=i@' => \$libs`，如果要使用"--libs　<lib1> <lib2> <lib3>"这种参数调用形式，在GetOptions()中使用 'libs=i{3}' => \@libs 指定每次传入3个值。可以试试'libs=i{1,}' => \@libs。
7.	`define=s`指定一个hash引用`%defines`，用`--define os=linux`传入一个hash参数，也可写成`"define=s%" => \$defines`；其他特点同上一个段落。
8. `set`指定调用子程序(subroutines)。

## 捆绑选项

```perl
use Getopt::Long;

Getopt::Long::Configure("bundling"); # 使用捆绑选项，default: disable
# 单个字符组成的：  -a -s -l
# 单个字符绑定起来：-asl
# 参数可能会带值，参数和值之间可以有空格，也可以没有：-s 24或-s24
# 可以用长名字来做更多的描述，前面用两个-：--size=24 或 --size 24

Getopt::Long::Configure("bundling_override"); # 用长选项重写`bundling`中出现的短选项，default: disable

Getopt::Long::Configure("ignore_case"); # default: enable，大小写不敏感，对bundling状态的-<single-character>选项无效；no_ignore_case该选项禁用，同时也会禁用ignore_case_always

Getopt::Long::Configure("ignore_case_always"); # 针对bundling状态的大小写忽略，default: disable

Getopt::Long::Configure("pass_through"); # 对于GetOptions()中无法识别或者不需要识别或者无效的选项，都不会返回错误。可以用于多级程序调用时的参数传递。因为GetOptions()会将识别的选项从@ARGV中取出，所以剩余的内容就可以继续传递到下一级程序。default: disable

Getopt::Long::Configure("debug"); # 查看Getopt::Long模块处理参数时的debug信息，default: disable
```

## ‘<>’

使用**GetOptions**解析命令行时，当遇到无法识别的字符或者本来不是命令行选项的选项，可以用`<>`捕获。

```perl
## '<>'只能指向函数引用，可以通过函数做很多有意义的事
GetOptions(
    '<>' => \&handle,
) or die ;

sub handle 
{
    my $catch = shift;
    print "catch: $catch\n";
}
```

## References

[Perl中的Getopt::Long模块](http://blog.sina.com.cn/s/blog_8ccee9ef0102ww70.html)

[perl模块 Getopt::Long解析参数][1]

[1]: https://blog.csdn.net/Aggressive_snail/article/details/53376750




							—— dulunar 后记于 2020.12