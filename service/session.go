package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"why-not-script/crawler"
	"why-not-script/httpclient"
	"why-not-script/store"
)

type CourseType struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type TestType struct {
	ClassCode string `json:"classCode"`
	TypeCode  string `json:"typeCode"`
}

type StudentSession struct {
	loginType  int
	user       string
	pwd        string
	token      string
	client     *httpclient.Client
	logStore   *store.LogStore
	queueStore *store.QueueStore

	loginStatus  string
	loginUser    string
	xnxqCode     string
	xnxqName     string
	userParams   map[string]any
	termInfo     map[string]any
	courseTypes1 []CourseType
	courseTypes2 []CourseType
	courseTypes3 []CourseType
	testTypesMap []TestType
}

func NewStudentSession(loginType int, user string, pwd string, token string, logStore *store.LogStore, queueStore *store.QueueStore) *StudentSession {
	session := &StudentSession{
		loginType:  loginType,
		user:       user,
		pwd:        pwd,
		token:      token,
		client:     httpclient.NewClient(),
		logStore:   logStore,
		queueStore: queueStore,
	}
	session.loginStatus = session.login()
	session.loginUser = session.user
	session.userParams, _ = session.getParams()
	session.termInfo, _ = session.getTermInfo()
	session.xnxqCode, session.xnxqName, _ = session.getXnxq()
	session.courseTypes1, session.courseTypes2, session.courseTypes3 = session.initCourseType()
	return session
}

func (s *StudentSession) LoginStatus() string {
	return s.loginStatus
}

func (s *StudentSession) LoginUser() string {
	return s.loginUser
}

func (s *StudentSession) XnxqName() string {
	return s.xnxqName
}

func (s *StudentSession) CheckStatus() bool {
	return true
}

func (s *StudentSession) SearchCourse(keyword string) ([]map[string]any, error) {
	if strings.TrimSpace(keyword) == "" {
		return []map[string]any{}, nil
	}
	form, err := httpclient.SearchCourseFn(s.userParams, s.termInfo, keyword)
	if err != nil {
		return nil, err
	}
	resp, err := s.client.Request(httpclient.SearchCourse, httpclient.RequestOptions{Form: form})
	if err != nil {
		return nil, err
	}
	courseList, err := crawler.ExtractCourseList(resp.String())
	if err != nil {
		return nil, err
	}
	if len(courseList) == 0 {
		return []map[string]any{}, nil
	}

	mergeList := []map[string]any{toAnyMap(courseList[0])}
	for i := 1; i < len(courseList); i++ {
		current := courseList[i]
		prev := mergeList[len(mergeList)-1]
		prevClass, _ := prev["上课班号"].(string)
		if current["上课班号"] != "" && current["上课班号"] == prevClass {
			prevTime, _ := prev["上课时间"].(string)
			currentTime := current["上课时间"]
			merged := strings.TrimSpace(strings.TrimSpace(prevTime) + ", " + strings.TrimSpace(currentTime))
			prev["上课时间"] = strings.Trim(merged, ", ")
		} else {
			mergeList = append(mergeList, toAnyMap(current))
		}
	}

	for i, item := range mergeList {
		item["序号"] = i + 1
	}

	return mergeList, nil
}

func (s *StudentSession) ApplyCourse(item store.QueueItem) {
	if item.User != s.user {
		return
	}
	if s.logStore != nil {
		s.logStore.WriteLog(item.ID, "{\"message\":\"己超过选课人数上限！\",\"status\":\"400\"}")
	}

	if false {
		fmt.Println(s.parseCourseType(item))
		fmt.Println(item.Data)
	}

	if false {
		// active, inactive, success, error
		_, _ = s.queueStore.UpdateQueueStatus(item.ID, "success")
		return
	}

	if true {
		resp1, _ := s.client.Request(httpclient.ApplyTempDESKey, httpclient.RequestOptions{})
		resp2, _ := s.client.Request(httpclient.ApplyTempNowTime, httpclient.RequestOptions{})
		kclb1, kclb2, kclb3 := s.parseCourseType(item)
		item.Data["kclb1"] = kclb1
		item.Data["kclb2"] = kclb2
		item.Data["kclb3"] = kclb3
		item.Data["khfs"] = s.guessCourseTestType(item.Data)
		_ = httpclient.ApplyCourseFn(resp1.String(), resp2.String(), s.termInfo, item.Data)
		//s.client.Request(httpclient.ApplyCourse, httpclient.RequestOptions{Form: httpclient.ApplyCourseFn()})
		_, _ = s.queueStore.UpdateQueueStatus(item.ID, "success")
	}
}

func (s *StudentSession) getParams() (map[string]any, error) {
	resp, err := s.client.Request(httpclient.UserParams, httpclient.RequestOptions{})
	if err != nil {
		return nil, err
	}
	return parseResultMap(resp.String())
}

func (s *StudentSession) getTermInfo() (map[string]any, error) {
	resp, err := s.client.Request(httpclient.TermInfo, httpclient.RequestOptions{})
	if err != nil {
		return nil, err
	}
	return parseResultMap(resp.String())
}

func (s *StudentSession) getXnxq() (string, string, error) {
	resp, err := s.client.Request(httpclient.XnxqInfo, httpclient.RequestOptions{Form: httpclient.XnxqInfoFn()})
	if err != nil {
		return "", "", err
	}
	var items []map[string]any
	if err := json.Unmarshal(resp.Body(), &items); err != nil {
		return "", "", err
	}
	if len(items) == 0 {
		return "", "", errors.New("empty term list")
	}
	code, _ := items[0]["code"].(string)
	name, _ := items[0]["name"].(string)
	s.xnxqCode = code
	s.xnxqName = name
	return code, name, nil
}

func (s *StudentSession) login() string {
	if s.loginType == 1 {
		resp, err := s.client.Request(httpclient.UserLoginPre, httpclient.RequestOptions{})
		if err != nil {
			return "exception"
		}
		pattern := regexp.MustCompile(`name="execution" value="([^"]+)"`)
		match := pattern.FindStringSubmatch(resp.String())
		if len(match) > 1 {
			execution := match[1]
			form := httpclient.UserLoginFn(s.user, s.pwd, execution)
			loginResp, err := s.client.Request(httpclient.UserLogin, httpclient.RequestOptions{Form: form})
			if err != nil {
				return "exception"
			}
			if strings.Contains(loginResp.String(), "登录成功 - 江西财经大学统一身份认证") {
				_, _ = s.client.Request(httpclient.EhallToken1, httpclient.RequestOptions{})
				_, _ = s.client.Request(httpclient.EhallToken2, httpclient.RequestOptions{})
			}
		}
	} else {
		jar := s.client.Cookies()
		if jar != nil {
			loginURL, _ := url.Parse("https://jwxt.jxufe.edu.cn")
			jar.SetCookies(loginURL, []*http.Cookie{{Name: "JSESSIONID", Value: s.token, Path: "/", Domain: "jwxt.jxufe.edu.cn"}})
		}
		resp, err := s.client.Request(httpclient.UserInfo, httpclient.RequestOptions{})
		if err != nil {
			return "exception"
		}
		pattern := regexp.MustCompile(`var\s+_loginid\s*=\s*'([^']+)'`)
		match := pattern.FindStringSubmatch(resp.String())
		if len(match) > 1 {
			s.user = match[1]
		}
	}

	resp, err := s.client.Request(httpclient.TermInfo, httpclient.RequestOptions{})
	if err != nil {
		return "exception"
	}
	_, err = parseResultMap(resp.String())
	if err != nil {
		return "exception"
	}
	return "success"
}

func (s *StudentSession) initCourseType() (type1, type2, type3 []CourseType) {
	resp1, err1 := s.client.Request(httpclient.GetAllCourseTypes, httpclient.RequestOptions{Form: httpclient.GetAllCourseTypesFn(1)})
	resp2, err2 := s.client.Request(httpclient.GetAllCourseTypes, httpclient.RequestOptions{Form: httpclient.GetAllCourseTypesFn(2)})
	resp3, err3 := s.client.Request(httpclient.GetAllCourseTypes, httpclient.RequestOptions{Form: httpclient.GetAllCourseTypesFn(3)})
	if err1 != nil || err2 != nil || err3 != nil {
		return
	}

	err1 = json.Unmarshal(resp1.Body(), &s.courseTypes1)
	err2 = json.Unmarshal(resp2.Body(), &s.courseTypes2)
	err3 = json.Unmarshal(resp3.Body(), &s.courseTypes3)

	// 特殊处理
	s.courseTypes2 = append(s.courseTypes2, CourseType{Code: "01", Name: "公共课"})

	if err1 != nil || err2 != nil || err3 != nil {
		return
	}

	return s.courseTypes1, s.courseTypes2, s.courseTypes3
}

func (s *StudentSession) Keepalive() bool {
	_, err := s.getTermInfo()
	if err != nil {
		return false
	}
	return true
}

func (s *StudentSession) parseCourseType(item store.QueueItem) (type1 string, type2 string, type3 string) {
	courseType1Code := ""
	courseType2Code := ""
	courseType3Code := ""

	mergeType := item.Data["类别"]

	if mergeType, ok := mergeType.(string); ok {
		sliceIndex := strings.LastIndex(mergeType, "/")
		if sliceIndex != -1 {
			courseType2Name := mergeType[:sliceIndex]
			courseType1Name := mergeType[sliceIndex+1:]
			for _, courseType := range s.courseTypes1 {
				if courseType1Name == courseType.Name {
					courseType1Code = courseType.Code
				}
			}
			for _, courseType := range s.courseTypes2 {
				if courseType2Name == courseType.Name {
					courseType2Code = courseType.Code
				}
			}
		}
	}

	courseCode := item.Data["课程代码"]
	if courseCode, ok := courseCode.(string); ok {
		resp, err := s.client.Request(httpclient.GetCourseInfo, httpclient.RequestOptions{Params: httpclient.GetCourseInfoFn(courseCode), Headers: map[string]string{}})
		if err != nil {
			return
		}
		re := regexp.MustCompile(`<kclb3mc>(.*?)</kclb3mc>`)
		match := re.FindStringSubmatch(resp.String())
		if len(match) > 1 {
			courseType3Name := match[1]
			for _, courseType := range s.courseTypes3 {
				if courseType3Name == courseType.Name {
					courseType3Code = courseType.Code
				}
			}
		}
	}

	return courseType1Code, courseType2Code, courseType3Code
}

func (s *StudentSession) guessCourseTestType(courseData map[string]any) (testType string) {
	for _, item := range s.testTypesMap {
		if item.ClassCode == getString(courseData, "上课班号") {
			fmt.Println("hit target")
			return item.ClassCode
		}
	}
	testType = "02"
	kclb1, kclb2, kclb3 := getString(courseData, "kclb1"), getString(courseData, "kclb2"), getString(courseData, "kclb3")
	courseName := getString(courseData, "课程")
	sliceIndex := strings.Index(courseName, "]")
	keyword := courseName[sliceIndex+1:]
	resp1, _ := s.client.Request(httpclient.GuessCourseTestType, httpclient.RequestOptions{Form: httpclient.GuessCourseTestTypeFn(s.xnxqCode, kclb1, kclb2, kclb3, "01", keyword)})
	resp2, _ := s.client.Request(httpclient.GuessCourseTestType, httpclient.RequestOptions{Form: httpclient.GuessCourseTestTypeFn(s.xnxqCode, kclb1, kclb2, kclb3, "02", keyword)})
	if strings.Contains(resp1.String(), getString(courseData, "上课班号")) {
		testType = "01"
	}
	if strings.Contains(resp2.String(), getString(courseData, "上课班号")) {
		testType = "02"
	}
	s.testTypesMap = append(s.testTypesMap, TestType{ClassCode: getString(courseData, "上课班号"), TypeCode: testType})
	return testType
}

func parseResultMap(body string) (map[string]any, error) {
	var outer map[string]any
	if err := json.Unmarshal([]byte(body), &outer); err != nil {
		return nil, err
	}
	result, ok := outer["result"].(string)
	if !ok {
		return nil, errors.New("missing result field")
	}
	var inner map[string]any
	if err := json.Unmarshal([]byte(result), &inner); err != nil {
		return nil, err
	}
	return inner, nil
}

func toAnyMap(values map[string]string) map[string]any {
	result := make(map[string]any, len(values))
	for key, value := range values {
		result[key] = value
	}
	return result
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
