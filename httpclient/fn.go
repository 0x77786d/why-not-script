package httpclient

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"math"
	"net/url"
	"strconv"
	"strings"
	"why-not-script/crypto"

	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/transform"
)

func UserLoginFn(user string, pwd string, execution string) url.Values {
	values := url.Values{}
	values.Set("username", user)
	values.Set("password", pwd)
	values.Set("captcha", "")
	values.Set("currentMenu", "1")
	values.Set("failN", "0")
	values.Set("mfaState", "")
	values.Set("execution", execution)
	values.Set("_eventId", "submit")
	values.Set("geolocation", "")
	values.Set("fpVisitorId", md5Hex(user))
	values.Set("trustAgent", "")
	values.Set("submit1", "Login1_m")
	return values
}

func GetCourseInfoFn(courseCode string) map[string]string {
	params := make(map[string]string)
	params["classPath"] = "C73E288D0DEA8D7F772BBD7F8FDC7E66F44C9E3992261989ECBAC5A3D722B306C6354658E0F25121E24CED075326C19885F263F369E5CD668E2EEE7CFB7EB57822A53D673186DA554A8CD65AE2B3DE0AA4B2718F415729BD0AC74B518706F6E6F61B7159924C542D577F814848F27128"
	params["mtd"] = "initCData"
	params["kcdm"] = courseCode
	return params
}

func XnxqInfoFn() url.Values {
	values := url.Values{}
	values.Set("comboBoxName", "Ms_KBBP_FBXQLLJXAP")
	values.Set("paramValue", "")
	values.Set("isYXB", "0")
	values.Set("isCDDW", "0")
	values.Set("isXQ", "0")
	values.Set("isDJKSLB", "0")
	values.Set("isZY", "0")
	return values
}

func GetAllCourseTypesFn(valueType int) url.Values {
	values := url.Values{}
	values.Set("comboBoxName", "MsKCLB"+strconv.Itoa(valueType))
	values.Set("paramValue", "")
	values.Set("isYXB", "0")
	values.Set("isCDDW", "0")
	values.Set("isXQ", "0")
	values.Set("isDJKSLB", "0")
	values.Set("isZY", "0")
	return values
}

func SearchCourseFn(userParams map[string]any, batchParams map[string]any, keyword string) (url.Values, error) {
	values := url.Values{}
	values.Set("initQry", "0")
	values.Set("isFormatSQL", "0")
	values.Set("xn", getString(batchParams, "xn"))
	values.Set("xn1", "")
	values.Set("_xq", "")
	values.Set("xq", getString(batchParams, "xqM"))
	values.Set("xh", getString(batchParams, "xh"))
	values.Set("zysx", getString(batchParams, "zysx"))
	values.Set("sfbd", getString(batchParams, "sfbd"))
	values.Set("djs", "undefined")
	values.Set("xsnj", getString(batchParams, "nj"))
	values.Set("xszydm", getString(batchParams, "zydm"))
	values.Set("xsfxnj", getString(userParams, "fxnj"))
	values.Set("xsfxzy", getString(userParams, "fxzy"))
	values.Set("xspycc", getString(userParams, "pycc"))
	values.Set("xsyxb", getString(userParams, "yxdm"))
	values.Set("qcyxkc", "0")
	values.Set("yxkxqxk", "0")
	values.Set("sfklbq", "0")
	values.Set("yxsjct", getString(batchParams, "yxsjct"))
	values.Set("yxsjct2", getString(batchParams, "yxsjct"))
	values.Set("wnjzyxkqykknj", getString(batchParams, "wnjzyqykxnj"))
	values.Set("tczfxpyfakc", getString(batchParams, "tczfxpyfakc"))
	values.Set("kgmc", "wsxk_wnjzyxksj")
	values.Set("qy_ggrxcl", getString(batchParams, "qyGgrxcl"))
	values.Set("electiveCourseForm.tkclb1", "undefined")
	values.Set("electiveCourseForm.tkclb2", "undefined")
	values.Set("xfsx", "undefined")
	values.Set("mssx", "undefined")
	values.Set("electiveCourseForm.xktype", "88")
	values.Set("electiveCourseForm.outnumber", "0")
	values.Set("lcid", getString(batchParams, "lcid"))
	values.Set("xxkckzfs", getString(batchParams, "xxkckzfs"))
	values.Set("yxkzyfxxk", getString(batchParams, "yxkzyfxxk"))
	values.Set("electiveCourseForm.nj", getString(batchParams, "nj"))
	values.Set("electiveCourseForm.zydm", getString(batchParams, "zydm"))
	values.Set("electiveCourseForm.kcdm", "")
	values.Set("electiveCourseForm.kclb1", "")
	values.Set("electiveCourseForm.kclb2", "")
	values.Set("electiveCourseForm.kclb3", "")
	values.Set("electiveCourseForm.khfs", "")
	values.Set("electiveCourseForm.xf", "")
	values.Set("electiveCourseForm.skbjdm", "")
	values.Set("electiveCourseForm.skbzdm", "")
	values.Set("electiveCourseForm.is_buy_book", "0")
	values.Set("electiveCourseForm.is_cx", "0")
	values.Set("electiveCourseForm.is_yxtj", "0")
	values.Set("electiveCourseForm.is_checkTime", "1")
	gbkKeyword, err := encodeGBK(keyword)
	if err != nil {
		return nil, err
	}
	values.Set("sel_kc", gbkKeyword)
	values.Set("sel_cddwdm", "")
	values.Set("sel_rkjs", "")
	values.Set("sel_xinqi", "")
	values.Set("chk_xsy", "1")
	values.Set("menucode_current", "S2020210")
	return values, nil
}

func ApplyCourseFn(deskey string, nowtime string, batchParams map[string]any, courseParams map[string]any) map[string]interface{} {
	xfFloat, err := strconv.ParseFloat(getString(courseParams, "学分"), 64)
	if err != nil {
		// Handle error as needed
		xfFloat = 0.0
	}
	var xf string
	if xfFloat == math.Trunc(xfFloat) {
		xf = strconv.Itoa(int(xfFloat))
	} else {
		xf = strconv.FormatFloat(xfFloat, 'g', -1, 64)
	}

	values := url.Values{}
	// User info
	values.Set("initQry", "0")
	values.Set("isFormatSQL", "0")
	values.Set("xn", getString(batchParams, "xn"))
	values.Set("xn1", "")
	values.Set("_xq", "")
	values.Set("xq", getString(batchParams, "xqM"))
	values.Set("xh", getString(batchParams, "xh"))
	values.Set("zysx", "")
	values.Set("sfbd", getString(batchParams, "sfbd"))
	values.Set("djs", "undefined")
	values.Set("xsnj", getString(batchParams, "nj"))
	values.Set("xszydm", getString(batchParams, "zydm"))
	values.Set("xsfxnj", "")
	values.Set("xsfxzy", "")
	values.Set("xspycc", "05")
	values.Set("xsyxb", getString(batchParams, "nj")[2:])
	values.Set("qcyxkc", "0")
	values.Set("yxkxqxk", getString(batchParams, "yxkxqxk"))
	values.Set("sfklbq", getString(batchParams, "sfklbq"))
	values.Set("yxsjct", getString(batchParams, "yxsjct"))
	values.Set("yxsjct2", getString(batchParams, "yxsjct"))
	values.Set("wnjzyxkqykknj", getString(batchParams, "wnjzyqykxnj"))
	values.Set("tczfxpyfakc", getString(batchParams, "tczfxpyfakc"))
	values.Set("kgmc", "wsxk_wnjzyxksj")
	values.Set("qy_ggrxcl", getString(batchParams, "qyGgrxcl"))
	values.Set("tkclb1", "undefined")
	values.Set("tkclb2", "undefined")
	values.Set("xfsx", "undefined")
	values.Set("mssx", "undefined")
	values.Set("xktype", "88") // 课外选课
	values.Set("outnumber", "0")
	values.Set("lcid", getString(batchParams, "lcid"))
	values.Set("xxkckzfs", getString(batchParams, "xxkckzfs"))
	values.Set("yxkzyfxxk", getString(batchParams, "yxkzyfxxk"))
	values.Set("nj", getString(batchParams, "nj"))
	values.Set("zydm", getString(batchParams, "zydm"))

	// Course info
	values.Set("kcdm", getString(courseParams, "课程代码"))
	values.Set("kclb1", getString(courseParams, "kclb1"))
	values.Set("kclb2", getString(courseParams, "kclb2"))
	values.Set("kclb3", getString(courseParams, "kclb3"))
	values.Set("khfs", getString(courseParams, "khfs"))
	values.Set("xf", xf)
	values.Set("skbjdm", getString(courseParams, "上课班号"))
	values.Set("skbzdm", "")
	values.Set("is_buy_book", "0")
	values.Set("is_cx", "0")
	values.Set("is_yxtj", "0")
	values.Set("is_checkTime", "1")
	values.Set("sel_kc", "")
	values.Set("sel_cddwdm", "")
	values.Set("sel_rkjs", "")
	values.Set("sel_xinqi", "")
	values.Set("menucode_current", "S2020210")

	urlEncoded := values.Encode()

	encrypted := crypto.DesEncrypt(deskey, urlEncoded)
	base64Encrypted := base64Encode(encrypted)
	md5UrlEncoded := md5Hex(urlEncoded)
	md5Nowtime := md5Hex(nowtime)
	token := md5Hex(md5UrlEncoded + md5Nowtime)

	return map[string]interface{}{
		"params":    base64Encrypted,
		"token":     token,
		"timestamp": nowtime,
	}
}

func GuessCourseTestTypeFn(xnxqCode, kclb1, kclb2, kclb3, khfs, keyword string) url.Values {
	values := url.Values{}
	sliceIndex := strings.LastIndex(xnxqCode, ",")
	xn := xnxqCode[:sliceIndex]
	xq := xnxqCode[sliceIndex+1:]
	values.Set("xnxq", xnxqCode)
	values.Set("hidXCX", "false")
	values.Set("xssj", "xssj")
	values.Set("xsrq", "xsrq")
	values.Set("fzsc", "fzsc")
	values.Set("pycc_m", "")
	values.Set("hid_kcmc", "")
	values.Set("menucode", "S")
	values.Set("hidOption", "qry")
	values.Set("qyejbm", "1")
	values.Set("xn", xn)
	values.Set("xn1", "")
	values.Set("_xq", "")
	values.Set("xq_m", xq)
	values.Set("selCDDW", "")
	values.Set("selKCLB2", kclb2)
	values.Set("selKCLB1", kclb1)
	values.Set("selKCLB3", kclb3)
	values.Set("selKCLB4", "")
	values.Set("selXQ", "")
	values.Set("selKHFS", khfs)
	values.Set("selSKFS", "")
	values.Set("chkXSDYRQ", "on")
	values.Set("chkXSDYSJ", "on")
	values.Set("chkfz", "on")
	values.Set("zcltval", "")
	values.Set("sel_yx", "")
	values.Set("pyccmc", "")
	values.Set("xz", "")
	values.Set("txt_kcmc", keyword)
	values.Set("menucode_current", "SB06")
	return values
}

func md5Hex(text string) string {
	sum := md5.Sum([]byte(text))
	return hex.EncodeToString(sum[:])
}

func base64Encode(text string) string {
	return base64.StdEncoding.EncodeToString([]byte(text))
}

func encodeGBK(text string) (string, error) {
	encoder := simplifiedchinese.GBK.NewEncoder()
	result, _, err := transform.String(encoder, text)
	if err != nil {
		return "", err
	}
	return result, nil
}

func urlEncode(values url.Values) string {
	return values.Encode()
}

func floatToString(value any) string {
	switch v := value.(type) {
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	case float32:
		return strconv.FormatFloat(float64(v), 'f', -1, 64)
	case int:
		return strconv.Itoa(v)
	case int64:
		return strconv.FormatInt(v, 10)
	case jsonNumber:
		return v.String()
	default:
		return ""
	}
}

type jsonNumber interface {
	String() string
}

func getString(values map[string]any, key string) string {
	if values == nil {
		return ""
	}
	value, ok := values[key]
	if !ok || value == nil {
		return ""
	}
	switch v := value.(type) {
	case string:
		return v
	case []byte:
		return string(v)
	case int:
		return strconv.Itoa(v)
	case int64:
		return strconv.FormatInt(v, 10)
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	case float32:
		return strconv.FormatFloat(float64(v), 'f', -1, 64)
	case jsonNumber:
		return v.String()
	default:
		return ""
	}
}
