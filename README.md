# Threecap Tryout

#### A basic tryout of [threecap](https://github.com/jbaicoianu/threecap)

+ __Last update:__  2018/03/17
+ __Version:__      1.0.3

[Repo](https://github.com/richplastow/threecap-tryout) &nbsp;
[Demo](http://richplastow.com/threecap-tryout/)  

```bash
$ ../ffmpeg -i ../threecap_2018-3-18_10-58-49.mp4 -r 25 -filter:v \
"setpts=0.04*PTS" ../threecap_2018-3-18_10-58-49-25fps.mp4
```
