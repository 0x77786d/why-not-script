package httpclient

type Interface struct {
	URL     string
	Headers map[string]string
	Method  string
	Desc    string
}

var (
	UserLoginPre = Interface{
		URL:    "https://ssl.jxufe.edu.cn/cas/login",
		Method: "GET",
		Desc:   "帐号登录预处理",
	}
	UserLogin = Interface{
		URL:    "https://ssl.jxufe.edu.cn/cas/login",
		Method: "POST",
		Desc:   "帐号登录",
	}
	EhallToken1 = Interface{
		URL:    "http://ehall.jxufe.edu.cn/login?service=http://ehall.jxufe.edu.cn/new/index.html",
		Method: "GET",
		Desc:   "门户令牌更新1",
	}
	EhallToken2 = Interface{
		URL:    "http://ehall.jxufe.edu.cn/appShow?appId=5853686007071845",
		Method: "GET",
		Desc:   "门户令牌更新2",
	}
	UserInfo = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/frame/home/js/SetMainInfo.jsp?v=250701",
		Method: "GET",
		Desc:   "帐号信息获取",
	}
	UserParams = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/jw/common/getStuGradeSpeciatyInfo.action",
		Method: "POST",
		Desc:   "用户参数获取",
	}
	TermInfo = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/jw/common/getWsxkTimeRange.action?xktype=88",
		Method: "POST",
		Desc:   "课外选课 - 学期信息获取",
	}
	XnxqInfo = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/frame/droplist/getDropLists.action",
		Method: "POST",
		Desc:   "学年学期信息获取",
	}
	SearchCourse = Interface{
		URL: "https://jwxt.jxufe.edu.cn/taglib/DataTable.jsp?tableId=5929078",
		Headers: map[string]string{
			"referer": "https://jwxt.jxufe.edu.cn/student/wsxk.wnjzyxk.html?menucode=S2020210",
		},
		Method: "POST",
		Desc:   "课程检索",
	}
	GetDESKey = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/custom/js/SetKingoEncypt.jsp",
		Method: "GET",
		Desc:   "获取DES密钥",
	}
	GetCourseInfo = Interface{
		URL: "https://jwxt.jxufe.edu.cn/STU_DynamicInitDataAction.do",
		Headers: map[string]string{
			"referer": "https://jwxt.jxufe.edu.cn/student/report/wsxk.llkc_info.html",
		},
		Method: "GET",
		Desc:   "获取课程信息",
	}
	GetAllCourseTypes = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/frame/droplist/getDropLists.action",
		Method: "POST",
		Desc:   "获取所有课程类别",
	}
	ApplyCourse = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/jw/common/saveElectiveCourse.action",
		Method: "POST",
		Desc:   "申请指定课程",
	}
	ApplyTempDESKey = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/frame/homepage?method=getTempDeskey",
		Method: "GET",
		Desc:   "申请临时密钥",
	}
	ApplyTempNowTime = Interface{
		URL:    "https://jwxt.jxufe.edu.cn/frame/homepage?method=getTempNowtime",
		Method: "GET",
		Desc:   "申请临时时间戳",
	}
	GuessCourseTestType = Interface{
		URL: "https://jwxt.jxufe.edu.cn/kbbp/dykb.qxkb.kc_data.jsp",
		Headers: map[string]string{
			"referer": "https://jwxt.jxufe.edu.cn/kbbp/dykb.qxkb.kc.html?menucode=SB06",
		},
		Method: "POST",
		Desc:   "枚举课程考核方式",
	}
)
