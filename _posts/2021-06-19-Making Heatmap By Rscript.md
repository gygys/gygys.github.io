---
layout:     post
title:      R数据可视化5:热图Heatmap
subtitle:   Linux, R, Statistics
date:       2021-06-19
author:     dulunar
header-img: img/post-bg-shipron.jpg
catalog: true
tags:
    - R
    - Linux
    - Statistics

---

# 什么是热图(Heatmap)
热图是一个以颜色变化来显示矩阵中的数值，生物学中热图经常用于展示多个基因在不同样本中的表达水平，然后可以通过聚类等方式查看不同组（如疾病组和对照组）特有的pattern（如CNV）。另外，热图还可以用于展示微生物的相对丰度、代谢组不同物质的含量等等。热图的另一个重要用处就是展现不同指标、不同样本等之间的相关性。热图因其丰富的色彩变化和生动饱满的信息表达被广泛应用于各种大数据分析场景。

很多做heatmap的软件，我们这里介绍的的是R，R默认中提供了heatmap函数。当然，R中也有很多具有heatmap功能的包，如下：

|    Packages    |   Plot FUNCTIONS   | Characteristic |
| :------------: | :----------------: | :------------: |
|     stats      |      heatmap       |                |
|    pheatmap    |      pheatmap      |                |
|  heatmap.plus  |    heatmap.plus    |                |
|     gplots     |     heatmap.2      |                |
|   d3heatmap    |     d3heatmap      |   交互式热图   |
|   heatmaply    |     heatmaply      |   交互式热图   |
|   iheatmapr    |      ihteamap      |   交互式热图   |
| ComplexHeatmap |      Heatmap       |   交互式热图   |
|    lattice     |     levelplot      |                |
|    ggplot2     | ggplot + geom_tile |                |



# 如何用R画热图
## 例子1
数据集展现：

|       | Sample1 | Sample2 | Sample3 | Sample4 | Sample5 | Sample6 | Sample7 | Sample8 |
| :---: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: |
| GeneA |   30    |   67    |   34    |   98    |   32    |    3    |   79    |   15    |
| GeneB |   80    |   70    |   28    |   51    |   74    |   76    |   85    |   98    |
| GeneC |   43    |   36    |   41    |   24    |   71    |   76    |   91    |   50    |
| GeneD |   88    |   66    |   57    |    8    |   11    |   91    |   71    |   84    |
| GeneE |   90    |   57    |   73    |   51    |   86    |   32    |   22    |   78    |
| GeneF |   31    |   87    |   65    |   36    |   64    |   15    |   28    |   89    |
| GeneG |    1    |   93    |   70    |   64    |   98    |   28    |   65    |   96    |
| GeneH |   27    |   18    |   37    |   85    |   59    |   61    |   85    |    3    |
| GeneI |   85    |   35    |   24    |   73    |   21    |   25    |   45    |   80    |
| GeneK |   16    |   55    |   76    |   60    |   40    |   48    |   85    |   90    |

在这里引入一个测试的数据集，下面是该数据的注释数据：

|      | sample_name | subject_drug |
| :--: | :---------: | :----------: |
|  1   |   Sample1   | MiracleDrugA |
|  2   |   Sample2   | MiracleDrugA |
|  3   |   Sample3   | MiracleDrugA |
|  4   |   Sample4   | MiracleDrugB |
|  5   |   Sample5   | MiracleDrugB |
|  6   |   Sample6   | MiracleDrugB |
|  7   |   Sample7   | MiracleDrugC |
|  8   |   Sample8   | MiracleDrugC |

把两个文件写在txt中，再读入到R中：

```R
library(data.table)
gLogCpmData = as.matrix(read.table("test_matrix.txt"))
gAnnotationData = read.table("test_annotation.txt")

# 针对不同的药物治疗的样本进行颜色的标注，A blue，B green， else red
mapDrugToColor<-function(annotations){
    colorsVector = ifelse(annotations["subject_drug"]=="MiracleDrugA", 
        "blue", ifelse(annotations["subject_drug"]=="MiracleDrugB", 
        "green", "red"))
    return(colorsVector)
}
```

除了上面的测试数据，大家也可以使用不同的包里面的数据：

```R
# gplots自带的数据集
library(gplots)
data(mtcar)

# 价格态度数据
data("attitude")
corr <- cor(attitude) ## cor计算相关性，然后变成矩阵

# highcharter自带的数据集
install.packages("highcharter")  
library(viridisLite)
data("vaccines")

# 
```

### heatmap

内置stats的heatmap包含有23想参数，先看看说明书：
```R
heatmap(x, Rowv = NULL, Colv =if(symm)"Rowv" else NULL,

        distfun = dist, hclustfun =hclust,

        reorderfun = function(d, w)reorder(d, w),

        add.expr, symm = FALSE, revC =identical(Colv, "Rowv"),

        scale = c("row","column", "none"), na.rm = TRUE,

        margins = c(5, 5), ColSideColors,RowSideColors,

        cexRow = 0.2 + 1/log10(nr),cexCol = 0.2 + 1/log10(nc),

        labRow = NULL, labCol = NULL,main = NULL,

        xlab = NULL, ylab = NULL,
        
        keep.dendro = FALSE, verbose =getOption("verbose"), ...)
```

参数中主要的参数是

> x， 需要绘图的矩阵
>
> Rowv， 决定“行系统树图”是否以及如何被计算和重新排序，其默认值为空；
>
> Colv， 决定“列系统树图”是否或如何被从排序。如果x是一个方矩阵（行列数相同），那么 表示着列与行的处理方式相同。
>
> scale，按照行或列进行归一化
>
> na.rm = TRUE，移除缺失值
>
> 说明书中没有提到的参数是颜色，可用参数 col=。

针对前面的数据，进行绘制：

```R
testHeatmap <- function(logCPM, annotations) {    
    sampleColors = mapDrugToColor(annotations)
    heatmap(logCPM, margins=c(5,8), ColSideColors=sampleColors)
}

testHeatmap(gLogCpmData, gAnnotationData)

mtcars <- data(mtcars)
df <- as.matrix((scale(mtcars)))#归一化、矩阵化
heatmap(df, scale = "none") ## 初始画图
# 使用自定义颜色
col <- colorRampPalette(c("red", "white", "blue"))(256)
heatmap(df, scale = "none", col=col)
#使用RColorBrewer color palette
library(RColorBrewer)col <- colorRampPalette(brewer.pal(10, "RdYlBu"))(256)#自设置调色板
dim(df) #查看行列数
heatmap(df, scale = "none", col=col, RowSideColors = rep(c("blue", "pink"), each=16), 
ColSideColors = c(rep("purple", 5), rep("orange", 6))) #参数RowSideColors和ColSideColors用于分别注释行和列颜色等
````

### heatmap.2

来自gplots的增强型热图绘制包；

```R
install.packages("gplots")
library(gplots)

testHeatmap2<-function(logCPM, annotations) {    
    sampleColors = mapDrugToColor(annotations)
    heatmap.2(logCPM, margins=c(5,8), ColSideColors=sampleColors,
        key.xlab="log CPM",
        key=TRUE, symkey=FALSE, density.info="none", trace="none")
}

testHeatmap2(gLogCpmData, gAnnotationData)

mtcars <- data(mtcars)
df <- as.matrix((scale(mtcars)))#归一化、矩阵化
heatmap.2(df, scale = "none", col=bluered(100), trace = "none", density.info = "none") 
```

### aheatmap

带注释的热图，是来自 NMF 包的热图绘图功能;

```R
install.packages("NMF")
library(NMF)

testAheatmap<-function(logCPM, annotations) {    
    aheatmap(logCPM, annCol=annotations[
        "subject_drug"])
}

testAheatmap(gLogCpmData, gAnnotationData)
```

### pheatmap

p代表pretty，这是pheatmap包的唯一功能；

#### 基础设置
main 图的名字
file 要保存图的名字
color 表示颜色，赋值渐变颜色调色板colorRampPalette属性，选择“绿，黑，红”渐变，分为100个等级,，例：color = colorRampPalette(c(“navy”, “white”, “firebrick3”))(102)
sclae 表示值均一化的方向，或者按照行或列，或者没有，值可以是"row", “column” 或者"none"
margins 表示页边空白的大小
fointsize 表示每一行的字体大小

#### 聚类相关设置
cluster_cols 表示进行列的聚类，值可以是FALSE或TRUE
cluster_row 同上，是否进行行的聚类
treeheight_row 设置row方向的聚类树高
treeheight_col 设置col方向的聚类树高
clustering_distance_row 表示行距离度量的方法
clustering_distance_cols 同上，表示列距离度量的方法
clustering_method 表示聚类方法，值可以是hclust的任何一种，如"ward.D",“single”, “complete”（默认）, “average”, “mcquitty”, “median”, “centroid”, “ward.D2”

#### legend设置
legend TRUE或者FALSE，表示是否显示图例
legend_breaks 设置图例的断点，格式：vector
legend_labels legend_breaks对应的标签 例：legend_breaks = -1:4, legend_labels = c(“0”,“1e-4”, “1e-3”, “1e-2”, “1e-1”, “1”)

#### 单元格设置
border_color 表示热图上单元格边框的颜色，如果不绘制边框，则使用NA
cellheight 表示每个单元格的高度
cellwidth 表示每个单元格的宽度
单元格中的数值显示：
display_numbers 表示是否将数值显示在热图的格子中，如果这是一个矩阵（与原始矩阵具有相同的尺寸），则显示矩阵的内容而不是原始值。
fontsize 表示热图中字体显示的大小
number_format 设置显示数值的格式，较常用的有"%.2f"（保留小数点后两位），"%.1e"（科学计数法显示，保留小数点后一位）
number_color 设置显示内容的颜色

#### 热图分割设置
cutree_rows 基于层次聚类（使用cutree）划分行的簇数（如果未聚集行，则忽略参数）
cutree_cols 基于层次聚类（使用cutree）划分列的簇数

#### annotation相关设置
annotation_row 行的分组信息，需要使用相应的行名称来匹配数据和注释中的行，注意之后颜色设置会考虑离散值还是连续值，格式要求为数据框
annotation_col 同上，列的分组信息
annotation_colors 用于手动指定annotation_row和annotation_col track颜色的列表。
annotation_names_row boolean值，显示是否应绘制行注释track的名称。
annotation_names_col 同上，显示是否应绘制列注释track的名称。

#### 绘制代码：

```R
install.packages("pheatmap")
library(pheatmap)

# 也可以使用数据集
data(all_data)


# 或者生成测试数据
test = matrix(rnorm(200), 20, 10)
test[1:10, seq(1, 10, 2)] = test[1:10, seq(1, 10, 2)] + 3
test[11:20, seq(2, 10, 2)] = test[11:20, seq(2, 10, 2)] + 2
test[15:20, seq(2, 10, 2)] = test[15:20, seq(2, 10, 2)] + 4
colnames(test) = paste("Test", 1:10, sep = "")
rownames(test) = paste("Gene", 1:20, sep = "")

## 对前面的数据进行绘制
testPheatmap<-function(logCPM, annotations) {    
    drug_info = data.frame(annotations[,"subject_drug"])
    rownames(drug_info) = annotations[["sample_name"]]
    
    # 从输入的注释数据进行列注释分配
    pheatmap(logCPM, annotation_col=drug_info, 
        annotation_names_row=FALSE,
        annotation_names_col=FALSE,
        fontsize_col=5)
    
    # 首先将列注释分配给中间变量，以便更改PheatMap的名称用于其图例
    subject_drug = annotations[["subject_drug"]]
    drug_df = data.frame(subject_drug)
    rownames(drug_df) = annotations[["sample_name"]]
    
    pheatmap(logCPM, annotation_col=drug_df, 
        annotation_names_row=FALSE,
        annotation_names_col=FALSE,
        fontsize_col=5)
}
testPheatmap(gLogCpmData, gAnnotationData)

# 行聚为3类
testPheatmap(gLogCpmData, gAnnotationData, kmeans_k = 3)

# 切分热图
testPheatmap(gLogCpmData, gAnnotationData，cluster_rows = F, gaps_row = c(10, 14), cluster_cols = T, cutree_col = 4)

```

### heatmap3

heatmap3 包的核心功能，不是heatmap.2的升级版；

```R
install.packages("heatmap3")
library(heatmap3)

testHeatmap3<-function(logCPM, annotations) {    
    sampleColors = mapDrugToColor(annotations)
    
     # 只分配列注释
    heatmap3(logCPM, margins=c(5,8), ColSideColors=sampleColors) 
    
    # 分配列注释并为它们制作自定义图例
    heatmap3(logCPM, margins=c(5,8), ColSideColors=sampleColors, 
        legendfun=function()showLegend(legend=c("MiracleDrugA", 
        "MiracleDrugB", "?"), col=c("blue", "green", "red"), cex=1.5))
    
    # 将列注释指定为迷你图而不是颜色，并为它们使用内置标签
    ColSideAnn<-data.frame(Drug=annotations[["subject_drug"]])
    heatmap3(logCPM,ColSideAnn=ColSideAnn,
        ColSideFun=function(x)showAnn(x),
        ColSideWidth=0.8)
}
             
testHeatmap3(gLogCpmData, gAnnotationData)
```

### annHeatmap2

Heatplus 软件包的核心功能；

```R
source("http://bioconductor.org/biocLite.R")
biocLite("Heatplus")
library(Heatplus)

testAnnHeatmap2<-function(logCPM, annotations){
    ann.dat = data.frame(annotations[,"subject_drug"])

    plot(annHeatmap2(logCPM, legend=2,
        ann = list(Col = list(data = ann.dat))))
}

testAnnHeatmap2(gLogCpmData, gAnnotationData)
```

### levelplot

来自lattice的热图绘制函数；

输入数据：这里的输入是一个包含 3 列的数据框，包含单元格的 X 和 Y 坐标及其值。 

```R
install.packages("lattice")
install.packages("latticeExtra")
library("lattice")
library(latticeExtra)

testlevelplot<-function(logCPM, annotations) { 
  hc=hclust(dist(logCPM)) ###按行聚类
  dd.row=as.dendrogram(hc) ###保存行聚类树形
  row.ord=order.dendrogram(dd.row) ###保存行聚类顺序
  hc=hclust(dist(t(logCPM))) ###按列聚类
  dd.col=as.dendrogram(hc) ###保存列聚类树形
  col.rod=order.dendrogram(dd.col) ###保存列聚类顺序
  logCPM1=logCPM[row.ord,] ###只对行聚类（是否对行、列聚类)
  levelplot(t(logCPM1), aspect = 'fill', colorkey = list(space = 'left', width = 1.5), xlab = '', ylab = '', legend = list(right = list(fun = dendrogramGrob, args = list(x = dd.row, rod = row.ord, side = 'right', size = 5)), scales= list(x = list(rot = 60)) ###x轴标签旋转60度
}
```

### d3heatmap

d3heatmap包可用于生成交互式热图绘制，有以下功能：

1. 将鼠标放在感兴趣热图单元格上以查看行列名称及相应值
2. 可选择区域进行缩放

```R
if (!require("devtools")) 
install.packages("devtools") 
devtools::install_github("rstudio/d3heatmap")

library(d3heatmap)
mtcars <- data(mtcars)
df <- as.matrix((scale(mtcars)))#归一化、矩阵化

d3heatmap(df, colors = "RdBu", k_row = 4, k_col = 2) # k_row、k_col分别指定用于对行列中树形图分支进行着色所需组数
# 使用dendextend包增强热图
library(dendextend) 
# order for rows
Rowv <- mtcars %>% scale %>% dist %>% hclust %>% as.dendrogram %>% set("branches_k_color", k = 3) %>% set("branches_lwd", 1.2) %>% ladderize
# Order for columns We must transpose the data
Colv <- mtcars %>% scale %>% t %>% dist %>% hclust %>% as.dendrogram %>% set("branches_k_color", k = 2, value = c("orange", "blue")) %>% set("branches_lwd", 1.2) %>% ladderize
#增强heatmap()函数
heatmap(df, Rowv = Rowv, Colv = Colv, scale = "none")
#增强heatmap.2()函数
heatmap.2(df, scale = "none", col = bluered(100), Rowv = Rowv, Colv = Colv, trace = "none", density.info = "none")
#增强交互式绘图函数
d3heatmap(scale(mtcars), colors = "RdBu", Rowv = Rowv, Colv = Colv)
```

### ComplexHeatmap

bioconductor包，用于绘制复杂热图，它提供了一个灵活的解决方案来安排和注释多个热图。它还允许可视化来自不同来源的不同数据之间的关联热图。

```R
if (!require("devtools"))
install.packages("devtools") 
devtools::install_github("jokergoo/ComplexHeatmap")

library(ComplexHeatmap)
mtcars <- data(mtcars)
df <- as.matrix((scale(mtcars)))#归一化、矩阵化
Heatmap(df, name = "mtcars")
#自设置颜色
library(circlize)
Heatmap(df, name = "mtcars", col = colorRamp2(c(-2, 0, 2), c("green", "white", "red")))
# 使用调色板
Heatmap(df, name = "mtcars",col = colorRamp2(c(-2, 0, 2), brewer.pal(n=3, name="RdBu")))
#自定义颜色
mycol <- colorRamp2(c(-2, 0, 2), c("blue", "white", "red"))
Heatmap(df, name = "mtcars", col = mycol, column_title = "Column title", row_title = 
"Row title") #热图及行列标题设置
# 行标题的默认位置是“left”，列标题的默认是“top”，可以使用以下选项更改：
  # row_title_side：允许的值为“左”或“右”（例如：row_title_side =“right”）
  # column_title_side：允许的值为“top”或“bottom”（例如：column_title_side =“bottom”） 也可以使用以下选项修改字体和大小：
  # row_title_gp：用于绘制行文本的图形参数
  # column_title_gp：用于绘制列文本的图形参数
  # show_row_names：是否显示行名称。默认值为TRUE
  # show_column_names：是否显示列名称。默认值为TRUE

# 默认情况下，行和列是包含在聚类里的，可以使用参数修改：
  # cluster_rows = FALSE。如果为TRUE，则在行上创建集群
  # cluster_columns = FALSE。如果为TRUE，则将列置于簇上

# 可以使用选项column_dend_height 和 row_dend_width 更改行列聚类的高度或宽度
Heatmap(df, name = "mtcars", col = mycol, column_dend_height = unit(2, "cm"), row_dend_width = unit(2, "cm") )

# 利用color_branches()自定义树状图外观
library(dendextend)
row_dend = hclust(dist(df)) # row clustering
col_dend = hclust(dist(t(df))) # column clustering
Heatmap(df, name = "mtcars", col = mycol, cluster_rows = color_branches(row_dend, k = 4), cluster_columns = color_branches(col_dend, k = 2)) # 行分为4类，列分为2类

# 参数clustering_distance_rows 和 clustering_distance_columns 用于分别指定行和列聚类的度量标准，允许的值有“euclidean”, “maximum”, “manhattan”, “canberra”, “binary”, “minkowski”, “pearson”, “spearman”, “kendall”。
Heatmap(df, name = "mtcars", clustering_distance_rows = "pearson", clustering_distance_columns = "pearson")

#也可以自定义距离计算方式
Heatmap(df, name = "mtcars", clustering_distance_rows = function(m) dist(m))
Heatmap(df, name = "mtcars", clustering_distance_rows = function(x, y) 1 - cor(x, y))

#行聚类clustering_distance_rows，列聚类使用相同的度量标准
# Clustering metric function
robust_dist = function(x, y) { 
    qx = quantile(x, c(0.1, 0.9)) qy = quantile(y, c(0.1, 0.9)) l = x > qx[1] & x < qx[2] & y > qy[1] & y < qy[2] x = x[l] y = y[l] sqrt(sum((x - y)^2))
}
# 画图
Heatmap(df, name = "mtcars", clustering_distance_rows = robust_dist, clustering_distance_columns = robust_dist, col = colorRamp2(c(-2, 0, 2), c("purple", "white", "orange")))

# 参数clustering_method_rows和clustering_method_columns可用于指定进行层次聚类的方法。允许的值是hclust()函数支持的值，包括“ward.D”，“ward.D2”，“single”，“complete”，“average”，…
Heatmap(df, name = "mtcars", clustering_method_rows = "ward.D", clustering_method_columns = "ward.D")

# 热图拆分，应用k-means使用参数km
set.seed(1122)
Heatmap(df, name = "mtcars", col = mycol, km = 2)

#由指定行类的向量分割
Heatmap(df, name = "mtcars", col = mycol, split = mtcars$cyl )
#split也可以是一个数据框，其中不同级别的组合拆分热图的行。
Heatmap(df, name ="mtcars", col = mycol, split = data.frame(cyl = mtcars$cyl, am = mtcars$am))
# Combine km and split
Heatmap(df, name ="mtcars", col = mycol, km = 2, split = mtcars$cyl)
#自定义分割
library("cluster")
set.seed(1122)
pa = pam(df, k = 3)
Heatmap(df, name = "mtcars", col = mycol, split = paste0("pam", pa$clustering))
# 将自定义的树形图和分割相结合
row_dend = hclust(dist(df)) # row clustering
grow_dend = color_branches(row_dend, k = 4)
Heatmap(df, name = "mtcars", col = mycol, cluster_rows = row_dend, split = 2)

# HeatmapAnnotation()对行或列注释
df <- t(df)
Heatmap(df, name ="mtcars", col = mycol)
# Annotation data frame
annot_df <- data.frame(cyl = mtcars$cyl, am = mtcars$am, mpg = mtcars$mpg)
# Define colors for each levels of qualitative variables
# Define gradient color for continuous variable (mpg)
col = list(cyl = c("4" = "green", "6" = "gray", "8" = "darkred"), am = c("0" = "yellow", 
"1" = "orange"), mpg = colorRamp2(c(17, 25), c("lightblue", "purple")) )
# Create the heatmap annotation
ha <- HeatmapAnnotation(annot_df, col = col)
# Combine the heatmap and the annotation
Heatmap(df, name = "mtcars", col = mycol, top_annotation = ha)
#可以使用参数show_legend = FALSE来隐藏注释图例
ha <- HeatmapAnnotation(annot_df, col = col, show_legend = FALSE)
Heatmap(df, name = "mtcars", col = mycol, top_annotation = ha)

#注释名称可以使用下面的R代码添加
library("GetoptLong")
# Combine Heatmap and annotation
ha <- HeatmapAnnotation(annot_df, col = col, show_legend = FALSE)
Heatmap(df, name = "mtcars", col = mycol, top_annotation = ha)
# 在右侧添加注释名称
for(an in colnames(annot_df)) { 
  seekViewport(qq("annotation_@{an}")) 
  grid.text(an, unit(1, "npc") + unit(2, "mm"), 0.5, default.units = "npc", just = "left")
}
#要在左侧添加注释名称，请使用以下代码
# Annotation names on the left
for(an in colnames(annot_df)) { 
  seekViewport(qq("annotation_@{an}")) grid.text(an, unit(1, "npc") - unit(2, "mm"), 0.5, default.units = "npc", just = "left")
}
#复杂注释
# Define some graphics to display the distribution of columns
.hist = anno_histogram(df, gp = gpar(fill = "lightblue"))
.density = anno_density(df, type = "line", gp = gpar(col = "blue"))
ha_mix_top = HeatmapAnnotation(hist = .hist, density = .density)
# Define some graphics to display the distribution of rows
.violin = anno_density(df, type = "violin", gp = gpar(fill = "lightblue"), which = "row")
.boxplot = anno_boxplot(df, which = "row")
ha_mix_right = HeatmapAnnotation(violin = .violin, bxplt = .boxplot, which = "row", 
width = unit(4, "cm"))
# Combine annotation with heatmap
Heatmap(df, name = "mtcars", col = mycol, column_names_gp = gpar(fontsize = 8), top_annotation = ha_mix_top, top_annotation_height = unit(4, "cm")) + ha_mix_right
    
#热图组合
# Heatmap 1
ht1 = Heatmap(df, name = "ht1", col = mycol, km = 2, column_names_gp = gpar(fontsize = 9))
# Heatmap 2
ht2 = Heatmap(df, name = "ht2", col = colorRamp2(c(-2, 0, 2), c("green", "white", "red")), column_names_gp = gpar(fontsize = 9))
# Combine the two heatmaps
ht1 + ht2
        
#可以使用选项width = unit（3，“cm”））来控制热图大小。注意，当组合多个热图时，第一个热图被视为主热图。剩余热图的一些设置根据主热图的设置自动调整。这些设置包括：删除行集群和标题，以及添加拆分等。
draw(ht1 + ht2, 
      # Titles 
     row_title = "Two heatmaps, row title",
     row_title_gp = gpar(col = "red"), 
     column_title = "Two heatmaps, column title", 
     column_title_side = "bottom", 
      # Gap between heatmaps 
     gap = unit(0.5, "cm"))
#可以使用参数show_heatmap_legend = FALSE，show_annotation_legend = FALSE删除图例。 
        
# 使用基因表达矩阵绘制热图
expr = readRDS(paste0(system.file(package = "ComplexHeatmap"), "/extdata/gene_expression.rds"))
mat = as.matrix(expr[, grep("cell", colnames(expr))])
type = gsub("s\\d+_", "", colnames(mat))
ha = HeatmapAnnotation(df = data.frame(type = type))
Heatmap(mat, name = "expression", km = 5, top_annotation = ha, top_annotation_height = unit(4, "mm"), show_row_names = FALSE, show_column_names = FALSE) + Heatmap(expr$length, name = "length", width = unit(5, "mm"), col = colorRamp2(c(0, 100000), c("white", "orange"))) + Heatmap(expr$type, name = "type", width = unit(5, "mm")) + Heatmap(expr$chr, name = "chr", width = unit(5, "mm"), col = rand_color(length(unique(expr$chr))))
        
#可视化矩阵中列的分布
densityHeatmap(df)
```

### ggplot2

#### geom_gtile

```R
library(reshape2)
library(ggplot2)
library(RColorBrewer)

corr <- cor(gLogCpmData)

# 使用三色阶颜色
plot <- function(m){
  ggplot(m, aes(x=Var1,y=Var2,fill=value)) +
    theme(legend.position="none", panel.background = element_blank(), axis.text = element_blank(), axis.ticks = element_blank()) + labs(x=NULL, y=NULL) +
    geom_tile(aes(fill=value)) +
    scale_fill_gradient2("Corr", low = "green", high = "red", mid = "white", midpoint = data("attitude")0.5, limit = c(0,1), space = "Lab") + coord_fixed()
}
plot(corr)

#使用自定义色阶
colors=colorRampPalette(rev(brewer.pal(n = 9, name ="RdYlBu")))(200)
plotn <- function(m){
  ggplot(m, aes(x=Var1,y=Var2,fill=value)) +
    theme(panel.background = element_blank(), axis.text = element_blank(), axis.ticks = element_blank()) + labs(x=NULL, y=NULL) +
    geom_tile(aes(fill=value)) +
    scale_fill_gradientn("Corr", colours = colors, space = "Lab") + coord_fixed()
}
plotn(corr)
```

#### geom_raster

```R
#在R中直接输入代码在CRAN上查找安装
install.packages("ggplot2")
install.packages("highcharter")  

#导入包
library(ggplot2) 
library(highcharter) 

#data
data("vaccines")

#将year转换成数值型
vaccines$year <- as.numeric(vaccines$year)

#作图
p <- ggplot(vaccines,aes(x=year,y=state,fill=count))+
  scale_x_continuous(breaks = seq(1928,2003,by=5)) +
  theme_bw()+
  theme(panel.grid.major = element_blank()) + 
  theme(legend.key=element_blank()) +
  geom_raster()

#采用GSEA调色板,灵感来自GSEA GenePattern生成的热图
install.packages("ggsci")
library(ggsci)
p + scale_fill_gsea()
```

### 图片拼接

#### 有缝拼接

```R
library(cowplot)
xplot <- ggdensity(iris, "Sepal.Length", fill = "Species",
                   palette = "jco")
yplot <- ggdensity(iris, "Sepal.Width", fill = "Species", 
                   palette = "jco") +
  rotate()

# Cleaning the plots
sp <- sp + rremove("legend")
yplot <- yplot + clean_theme() + rremove("legend")
xplot <- xplot + clean_theme() + rremove("legend")
# Arranging the plot using cowplot
plot_grid(xplot, NULL, sp, yplot, ncol = 2, align = "hv", rel_widths = c(2, 1), rel_heights = c(1, 2))
```

#### 无缝拼接

```R
library(cowplot)
p1 <- insert_xaxis_grob(pmain, xdens, grid::unit(.2, "null"), position = "top")
p2 <- insert_yaxis_grob(p1, ydens, grid::unit(.2, "null"), position = "right")
ggdraw(p2)
```

## 例子2：

```R
library(ggplot2)
library(ALL) #可以使用biocLite("ALL")安装该数据包
data("ALL")
library(limma)
eset<-ALL[,ALL$mol.biol %in% c("BCR/ABL","ALL1/AF4")]
f<-factor(as.character(eset$mol.biol))
design<-model.matrix(~f)
fit<-eBayes(lmFit(eset,design)) #对基因芯片数据进行分析，得到差异表达的数据
selected  <- p.adjust(fit$p.value[, 2]) <0.001 
esetSel <- eset[selected,] #选择其中一部分绘制热图
dim(esetSel) #从这尺度上看，数目并不多，但也不少。如果基因数过多，可以分两次做图。
Features  Samples 
      84       47 
library(hgu95av2.db)
data<-exprs(esetSel)
probes<-rownames(data)
symbol<-mget(probes,hgu95av2SYMBOL,ifnotfound=NA)
symbol<-do.call(rbind,symbol)
symbol[is.na(symbol[,1]),1]<-rownames(symbol)[is.na(symbol[,1])]
rownames(data)<-symbol[probes,1] #给每行以基因名替换探针名命名，在绘制热图时直接显示基因名。
heatmap(data,cexRow=0.5)

# 使用heatmap函数top.colors填充生成的热图
color.map <- function(mol.biol) { if (mol.biol=="ALL1/AF4") "#FF0000" else "#0000FF" }
patientcolors <- unlist(lapply(esetSel$mol.bio, color.map))
heatmap(data, col=topo.colors(100), ColSideColors=patientcolors, cexRow=0.5)

# heatmap.plus
library(heatmap.plus)
hc<-hclust(dist(t(data)))
dd.col<-as.dendrogram(hc)
groups <- cutree(hc,k=5)
color.map <- function(mol.biol) { if (mol.biol=="ALL1/AF4") 1 else 2 }
patientcolors <- unlist(lapply(esetSel$mol.bio, color.map))
col.patientcol<-rbind(groups,patientcolors)
mode(col.patientcol)<-"character"
heatmap.plus(data,ColSideColors=t(col.patientcol),cexRow=0.5)

# heatmap.2
library("gplots")
heatmap.2(data, col=redgreen(75), scale="row", ColSideColors=patientcolors, key=TRUE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)

# heatmap.2修改颜色
heatmap.2(data, col=heat.colors(100), scale="row", ColSideColors=patientcolors,
+ key=TRUE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)
heatmap.2(data, col=terrain.colors(100), scale="row", ColSideColors=patientcolors,
+ key=TRUE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)
heatmap.2(data, col=cm.colors(100), scale="row", ColSideColors=patientcolors,
+ key=TRUE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)
heatmap.2(data, col=redblue(100), scale="row", ColSideColors=patientcolors,
+ key=TRUE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)
heatmap.2(data, col=colorpanel(100,low="white",high="steelblue"), scale="row", ColSideColors=patientcolors,
+ key=TRUE, keysize=1, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)
                                   
# ggplot2当中的geom_tile
library(ggplot2)
hc<-hclust(dist(data))
rowInd<-hc$order
hc<-hclust(dist(t(data)))
colInd<-hc$order
data.m<-data[rowInd,colInd] #聚类分析的作用是为了色块集中，显示效果好。如果本身就对样品有分组，基因有排序，就可以跳过这一步。
data.m<-apply(data.m,1,rescale) #以行为基准对数据进行变换，使每一行都变成［0,1］之间的数字。变换的方法可以是scale,rescale等等，按照自己的需要来变换。
data.m<-t(data.m) #变换以后转置了。
coln<-colnames(data.m) 
rown<-rownames(data.m) #保存样品及基因名称。因为geom_tile会对它们按坐标重排，所以需要使用数字把它们的序列固定下来。
colnames(data.m)<-1:ncol(data.m)
rownames(data.m)<-1:nrow(data.m)
data.m<-melt(data.m) #转换数据成适合geom_tile使用的形式
head(data.m)
  X1 X2     value
1  1  1 0.1898007
2  2  1 0.6627467
3  3  1 0.5417057
4  4  1 0.4877054
5  5  1 0.5096474
6  6  1 0.2626248
base_size<-12 #设置默认字体大小，依照样品或者基因的多少而微变。
(p <- ggplot(data.m, aes(X2, X1)) + geom_tile(aes(fill = value), #设定横坐标为以前的列，纵坐标为以前的行，填充色为转换后的数据
+ colour = "white") + scale_fill_gradient(low = "white", #设定渐变色的低值为白色，变值为钢蓝色。
+ high = "steelblue"))
p + theme_grey(base_size = base_size) + labs(x = "", #设置xlabel及ylabel为空
+ y = "") + scale_x_continuous(expand = c(0, 0),labels=coln,breaks=1:length(coln)) + #设置x坐标扩展部分为0，刻度为之前的样品名
+ scale_y_continuous(expand = c(0, 0),labels=rown,breaks=1:length(rown)) + opts( #设置y坐标扩展部分为0，刻度为之前的基因名
+ axis.ticks = theme_blank(), axis.text.x = theme_text(size = base_size *  #设置坐标字体为基准的0.8倍，贴近坐标对节，x坐标旋转90度，色彩为中灰
+ 0.8, angle = 90, hjust = 0, colour = "grey50"), axis.text.y = theme_text(
+ size = base_size * 0.8, hjust=1, colour="grey50"))
                                 
# gplot2修改颜色，红黄渐变
(p <- ggplot(data.m, aes(X2, X1)) + geom_tile(aes(fill = value),
+ colour = "white") + scale_fill_gradient(low = "yellow",
+ high = "red"))
p + theme_grey(base_size = base_size) + labs(x = "",
+ y = "") + scale_x_continuous(expand = c(0, 0),labels=coln,breaks=1:length(coln)) +
+ scale_y_continuous(expand = c(0, 0),labels=rown,breaks=1:length(rown)) + opts(
+ axis.ticks = theme_blank(), axis.text.x = theme_text(size = base_size *
+ 0.8, angle = 90, hjust = 0, colour = "grey50"), axis.text.y = theme_text(
+ size = base_size * 0.8, hjust=1, colour="grey50"))

# 红绿渐变
(p <- ggplot(data.m, aes(X2, X1)) + geom_tile(aes(fill = value),
+ colour = "white") + scale_fill_gradient(low = "green",
+ high = "red"))
p + theme_grey(base_size = base_size) + labs(x = "",
+ y = "") + scale_x_continuous(expand = c(0, 0),labels=coln,breaks=1:length(coln)) +
+ scale_y_continuous(expand = c(0, 0),labels=rown,breaks=1:length(rown)) + opts(
+ axis.ticks = theme_blank(), axis.text.x = theme_text(size = base_size *
+ 0.8, angle = 90, hjust = 0, colour = "grey50"), axis.text.y = theme_text(
+ size = base_size * 0.8, hjust=1, colour="grey50"))
                                 
# 绿白渐变
(p <- ggplot(data.m, aes(X2, X1)) + geom_tile(aes(fill = value),
+ colour = "white") + scale_fill_gradient(low = "seagreen",
+ high = "white"))
p + theme_grey(base_size = base_size) + labs(x = "",
+ y = "") + scale_x_continuous(expand = c(0, 0),labels=coln,breaks=1:length(coln)) +
+ scale_y_continuous(expand = c(0, 0),labels=rown,breaks=1:length(rown)) + opts(
+ axis.ticks = theme_blank(), axis.text.x = theme_text(size = base_size *
+ 0.8, angle = 90, hjust = 0, colour = "grey50"), axis.text.y = theme_text(
+ size = base_size * 0.8, hjust=1, colour="grey50"))
                                 
# 棕白渐变
(p <- ggplot(data.m, aes(X2, X1)) + geom_tile(aes(fill = value),
+ colour = "white") + scale_fill_gradient(low = "white",
+ high = "sienna4"))
p + theme_grey(base_size = base_size) + labs(x = "",
+ y = "") + scale_x_continuous(expand = c(0, 0),labels=coln,breaks=1:length(coln)) +
+ scale_y_continuous(expand = c(0, 0),labels=rown,breaks=1:length(rown)) + opts(
+ axis.ticks = theme_blank(), axis.text.x = theme_text(size = base_size *
+ 0.8, angle = 90, hjust = 0, colour = "grey50"), axis.text.y = theme_text(
+ size = base_size * 0.8, hjust=1, colour="grey50"))      
                                 
# 灰阶填充
(p <- ggplot(data.m, aes(X2, X1)) + geom_tile(aes(fill = value),
+ colour = "white") + scale_fill_gradient(low = "black",
+ high = "gray85"))
p + theme_grey(base_size = base_size) + labs(x = "",
+ y = "") + scale_x_continuous(expand = c(0, 0),labels=coln,breaks=1:length(coln)) +
+ scale_y_continuous(expand = c(0, 0),labels=rown,breaks=1:length(rown)) + opts(
+ axis.ticks = theme_blank(), axis.text.x = theme_text(size = base_size *
+ 0.8, angle = 90, hjust = 0, colour = "grey50"), axis.text.y = theme_text(
+ size = base_size * 0.8, hjust=1, colour="grey50"))
                                 
# lattice的levelplot绘制，heat.colors填充，dendrogramGrob绘树型
hc<-hclust(dist(data))
dd.row<-as.dendrogram(hc)
row.ord<-order.dendrogram(dd.row) #介绍另一种获得排序的办法
hc<-hclust(dist(t(data)))
dd.col<-as.dendrogram(hc)
col.ord<-order.dendrogram(dd.col)
data.m<-data[row.ord,col.ord]
library(ggplot2)
data.m<-apply(data.m,1,rescale) #rescale是ggplot2当中的一个函数
library(lattice)
levelplot(data.m,
+           aspect = "fill",xlab="",ylab="",
+           scales = list(x = list(rot = 90, cex=0.8),y=list(cex=0.5)),
+           colorkey = list(space = "left"),col.regions = heat.colors)
library(latticeExtra)
levelplot(data.m,
+           aspect = "fill",xlab="",ylab="",
+           scales = list(x = list(rot = 90, cex=0.5),y=list(cex=0.4)),
+           colorkey = list(space = "left"),col.regions = heat.colors,
+           legend =
+           list(right =
+                list(fun = dendrogramGrob, #dendrogramGrob是latticeExtra中绘制树型图的一个函数
+                     args =
+                     list(x = dd.row, ord = row.ord,
+                          side = "right",
+                          size = 5)),
+                top =
+                list(fun = dendrogramGrob,
+                     args =
+                     list(x = dd.col, 
+                          side = "top",
+                          type = "triangle")))) #使用三角型构图
                                 
# pheatmap 绘制
library(pheatmap)
pheatmap(data,fontsize=9, fontsize_row=6) #最简单地直接出图
pheatmap(data, scale = "row", clustering_distance_row = "correlation", fontsize=9, fontsize_row=6) #改变排序算法
pheatmap(data, color = colorRampPalette(c("navy", "white", "firebrick3"))(50), fontsize=9, fontsize_row=6) #自定义颜色
pheatmap(data, cluster_row=FALSE, fontsize=9, fontsize_row=6) #关闭按行排序
pheatmap(data, legend = FALSE, fontsize=9, fontsize_row=6) #关闭图例
pheatmap(data, cellwidth = 6, cellheight = 5, fontsize=9, fontsize_row=6) #设定格子的尺寸
color.map <- function(mol.biol) { if (mol.biol=="ALL1/AF4") 1 else 2 }
patientcolors <- unlist(lapply(esetSel$mol.bio, color.map))
hc<-hclust(dist(t(data)))
dd.col<-as.dendrogram(hc)
groups <- cutree(hc,k=7)
annotation<-data.frame(Var1=factor(patientcolors,labels=c("class1","class2")),Var2=groups)
pheatmap(data, annotation=annotation, fontsize=9, fontsize_row=6) #为样品分组
Var1 = c("navy", "skyblue")
Var2 = c("snow", "steelblue")
names(Var1) = c("class1", "class2")
ann_colors = list(Var1 = Var1, Var2 = Var2)
pheatmap(data, annotation=annotation, annotation_colors = ann_colors, fontsize=9, fontsize_row=6) #为分组的样品设定颜色
```

# 热图美化

实际应用中，异常值的出现会毁掉一张热图。这通常不是我们想要的。为了更好的可视化效果，需要对数据做些预处理，主要有对数转换，Z-score转换，抹去异常值，非线性颜色等方式。

## 对数转换

```R
data <- c(rnorm(5,mean=5), rnorm(5,mean=20), rnorm(5, mean=100), c(600,700,800,900,10000))
data <- matrix(data, ncol=5, byrow=T)
data <- as.data.frame(data)
rownames(data) <- letters[1:4]
colnames(data) <- paste("Grp", 1:5, sep="_")
data
    Grp_1      Grp_2      Grp_3      Grp_4        Grp_5
a   6.61047  20.946720 100.133106 600.000000     5.267921
b  20.80792  99.865962 700.000000   3.737228    19.289715
c 100.06930 800.000000   6.252753  21.464081    98.607518
d 900.00000   3.362886  20.334078 101.117728 10000.000000
# 对数转换
# +1是为了防止对0取对数；是加1还是加个更小的值取决于数据的分布。
# 加的值一般认为是检测的低阈值，低于这个值的数字之间的差异可以忽略。
data_log <- log2(data+1)
data_log
    Grp_1    Grp_2    Grp_3    Grp_4     Grp_5
a 2.927986 4.455933 6.660112 9.231221  2.647987
b 4.446780 6.656296 9.453271 2.244043  4.342677
c 6.659201 9.645658 2.858529 4.489548  6.638183
d 9.815383 2.125283 4.415088 6.674090 13.287857
data_log$ID = rownames(data_log)
data_log_m = melt(data_log, id.vars=c("ID"))
 
p <- ggplot(data_log_m, aes(x=variable,y=ID)) + xlab("samples") + ylab(NULL) + theme_bw() + theme(panel.grid.major = element_blank()) + theme(legend.key=element_blank()) + theme(axis.text.x=element_text(angle=45,hjust=1, vjust=1)) + theme(legend.position="top") +  geom_tile(aes(fill=value)) + scale_fill_gradient(low = "white", high = "red")
ggsave(p, filename="heatmap_log.pdf", width=8, height=12, units=c("cm"),colormodel="srgb")
```

对数转换后的数据，看起来就清晰的多了。而且对数转换后，数据还保留着之前的变化趋势，不只是基因在不同样品之间的表达可比 (同一行的不同列)，不同基因在同一样品的值也可比 (同一列的不同行) (不同基因之间比较表达值存在理论上的问题，即便是按照长度标准化之后的FPKM也不代表基因之间是完全可比的)。

## Z-score转换

Z-score又称为标准分数，是一组数中的每个数减去这一组数的平均值再除以这一组数的标准差，代表的是原始分数距离原始平均值的距离，以标准差为单位。可以对不同分布的各原始分数进行比较，用来反映数据的相对变化趋势，而非绝对变化量。

```R
data_ori <- "Grp_1;Grp_2;Grp_3;Grp_4;Grp_5
a;6.6;20.9;100.1;600.0;5.2
b;20.8;99.8;700.0;3.7;19.2
c;100.0;800.0;6.2;21.4;98.6
d;900;3.3;20.3;101.1;10000"
data <- read.table(text=data_ori, header=T, row.names=1, sep=";", quote="")
  
# 去掉方差为0的行，也就是值全都一致的行
data <- data[apply(data,1,var)!=0,]
data
  Grp_1 Grp_2 Grp_3 Grp_4   Grp_5
a   6.6  20.9 100.1 600.0     5.2
b  20.8  99.8 700.0   3.7    19.2
c 100.0 800.0   6.2  21.4    98.6
d 900.0   3.3  20.3 101.1 10000.0
 
# 标准化数据，获得Z-score，并转换为data.frame
data_scale <- as.data.frame(t(apply(data,1,scale)))
  
# 重命名列
colnames(data_scale) <- colnames(data)
data_scale
       Grp_1      Grp_2      Grp_3      Grp_4      Grp_5
a -0.5456953 -0.4899405 -0.1811446  1.7679341 -0.5511538
b -0.4940465 -0.2301542  1.7747592 -0.5511674 -0.4993911
c -0.3139042  1.7740182 -0.5936858 -0.5483481 -0.3180801
d -0.2983707 -0.5033986 -0.4995116 -0.4810369  1.7823177
data_scale$ID = rownames(data_scale)
data_scale_m = melt(data_scale, id.vars=c("ID"))
  
p <- ggplot(data_scale_m, aes(x=variable,y=ID)) + xlab("samples") + ylab(NULL) + theme_bw() + theme(panel.grid.major = element_blank()) + theme(legend.key=element_blank()) + theme(axis.text.x=element_text(angle=45,hjust=1, vjust=1)) +  geom_tile(aes(fill=value)) + scale_fill_gradient(low = "white", high = "red")
ggsave(p, filename="heatmap_scale.pdf", width=8, height=12, units=c("cm"),colormodel="srgb")
```

Z-score转换后，颜色分布也相对均一了，每个基因在不同样品之间的表达的高低一目了然。但是不同基因之间就完全不可比了。

## 抹去异常值

粗暴一点，假设检测饱和度为100，大于100的值都视为100对待。

```R
data_ori <- "Grp_1;Grp_2;Grp_3;Grp_4;Grp_5
a;6.6;20.9;100.1;600.0;5.2
b;20.8;99.8;700.0;3.7;19.2
c;100.0;800.0;6.2;21.4;98.6
d;900;3.3;20.3;101.1;10000"
data <- read.table(text=data_ori, header=T, row.names=1, sep=";", quote="")
  
data[data>100] <- 100
data
  Grp_1 Grp_2 Grp_3 Grp_4 Grp_5
a   6.6  20.9 100.0 100.0   5.2
b  20.8  99.8 100.0   3.7  19.2
c 100.0 100.0   6.2  21.4  98.6
d 100.0   3.3  20.3 100.0 100.0
 
data$ID = rownames(data)
data_m = melt(data, id.vars=c("ID"))
  
p <- ggplot(data_m, aes(x=variable,y=ID)) + xlab("samples") + ylab(NULL) + theme_bw() + theme(panel.grid.major = element_blank()) + theme(legend.key=element_blank()) + theme(axis.text.x=element_text(angle=45,hjust=1, vjust=1)) +  geom_tile(aes(fill=value)) + scale_fill_gradient(low = "white", high = "red")
ggsave(p, filename="heatmap_nooutlier.pdf", width=8, height=12, units=c("cm"),colormodel="srgb")
```

虽然损失了一部分信息，但整体模式还是出来了。只是在选择异常值标准时需要根据实际确认。

## 非线性颜色

正常来讲，颜色的赋予在最小值到最大值之间是均匀分布的。非线性颜色则是对数据比较小但密集的地方赋予更多颜色，数据大但分布散的地方赋予更少颜色，这样既能加大区分度，又最小的影响原始数值。通常可以根据数据模式，手动设置颜色区间。为了方便自动化处理，我一般选择用四分位数的方式设置颜色区间。

```R
data_ori <- "Grp_1;Grp_2;Grp_3;Grp_4;Grp_5
a;6.6;20.9;100.1;600.0;5.2
b;20.8;99.8;700.0;3.7;19.2
c;100.0;800.0;6.2;21.4;98.6
d;900;3.3;20.3;101.1;10000"
 
data <- read.table(text=data_ori, header=T, row.names=1, sep=";", quote="")
data$ID = rownames(data)
data_m = melt(data, id.vars=c("ID"))

# 获取数据的最大、最小、第一四分位数、中位数、第三四分位数
summary_v <- summary(data_m$value)
summary_v
    Min.  1st Qu.   Median     Mean  3rd Qu.     Max.
    3.30    16.05    60.00   681.40   225.80 10000.00
# 在最小值和第一四分位数之间划出6个区间，第一四分位数和中位数之间划出6个区间，中位数和第三四分位数之间划出5个区间，最后的数划出5个区间
break_v <- unique(c(seq(summary_v[1]*0.95,summary_v[2],length=6),seq(summary_v[2],summary_v[3],length=6),seq(summary_v[3],summary_v[5],length=5),seq(summary_v[5],summary_v[6]*1.05,length=5)))
break_v
 [1]     3.135     5.718     8.301    10.884    13.467    16.050    24.840
 [8]    33.630    42.420    51.210    60.000   101.450   142.900   184.350
[15]   225.800  2794.350  5362.900  7931.450 10500.000
# 安照设定的区间分割数据
# 原始数据替换为了其所在的区间的数值
data_m$value <- cut(data_m$value, breaks=break_v,labels=break_v[2:length(break_v)])
break_v=unique(data_m$value)
data_m
   ID variable   value
1   a    Grp_1   8.301
2   b    Grp_1   24.84
3   c    Grp_1  101.45
4   d    Grp_1 2794.35
5   a    Grp_2   24.84
6   b    Grp_2  101.45
7   c    Grp_2 2794.35
8   d    Grp_2   5.718
9   a    Grp_3  101.45
10  b    Grp_3 2794.35
11  c    Grp_3   8.301
12  d    Grp_3   24.84
13  a    Grp_4 2794.35
14  b    Grp_4   5.718
15  c    Grp_4   24.84
16  d    Grp_4  101.45
17  a    Grp_5   5.718
18  b    Grp_5   24.84
19  c    Grp_5  101.45
20  d    Grp_5   10500

# 虽然看上去还是数值，但已经不是数字类型了
# 而是不同的因子了，这样就可以对不同的因子赋予不同的颜色了
> is.numeric(data_m$value)
[1] FALSE
> is.factor(data_m$value)
[1] TRUE
break_v
#[1] 8.301   24.84   101.45  2794.35 5.718   10500
#18 Levels: 5.718 8.301 10.884 13.467 16.05 24.84 33.63 42.42 51.21 … 10500
  
# 产生对应数目的颜色
gradientC=c('green','yellow','red')
col <- colorRampPalette(gradientC)(length(break_v))
col
#[1] "#00FF00" "#66FF00" "#CCFF00" "#FFCB00" "#FF6500" "#FF0000"
p <- ggplot(data_m, aes(x=variable,y=ID)) + xlab("samples") + ylab(NULL) + theme_bw() + theme(panel.grid.major = element_blank()) + theme(legend.key=element_blank()) + theme(axis.text.x=element_text(angle=45,hjust=1, vjust=1)) +  geom_tile(aes(fill=value))
  
# 与上面不同的地方，使用的是scale_fill_manual逐个赋值
p <- p + scale_fill_manual(values=col)
ggsave(p, filename="heatmap_nonlinear.pdf", width=8, height=12, units=c("cm"),colormodel="srgb")
```

## 调整行的顺序或列

如果想保持图中每一行的顺序与输入的数据框一致，需要设置因子的水平。这也是ggplot2中调整图例或横纵轴字符顺序的常用方式。

```R
data_rowname <- rownames(data)
data_rowname <- as.vector(rownames(data))
data_rownames <- rev(data_rowname)
data_log_m$ID <- factor(data_log_m$ID, levels=data_rownames, ordered=T)
p <- ggplot(data_log_m, aes(x=variable,y=ID)) + xlab(NULL) + ylab(NULL) + theme_bw() + theme(panel.grid.major = element_blank()) + theme(legend.key=element_blank()) + theme(axis.text.x=element_text(angle=45,hjust=1, vjust=1)) + theme(legend.position="top") +  geom_tile(aes(fill=value)) + scale_fill_gradient(low = "white", high = "red")
ggsave(p, filename="heatmap_log.pdf", width=8, height=12, units=c("cm"),colormodel="srgb")
```

# References

[R绘图基础（10）热图 heatmap - PLoB](https://www.plob.org/article/10156.html)

[Making HeatMap in R - UCSD](http://compbio.ucsd.edu/making-heat-maps-r)

[r graph gallery heatmap](https://www.r-graph-gallery.com/heatmap.html)

[R语言学习笔记之热图绘制](https://www.jianshu.com/p/398115d2d2e8)

[R-多种方法绘制静态与交互式热图](https://zhuanlan.zhihu.com/p/93826698)

[pheatmap画热图](https://www.jianshu.com/p/718b22bb1148)

[csdn pheatmap包](https://blog.csdn.net/lalaxumelala/article/details/86022722?utm_medium=distribute.pc_relevant.none-task-blog-baidulandingword-8&spm=1001.2101.3001.4242)

[热图美化](https://www.cnblogs.com/freescience/p/7451133.html)
