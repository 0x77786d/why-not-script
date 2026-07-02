package service

import (
	"why-not-script/httpclient"
)

func (s *StudentSession) ApplyCourseTest(courseParams map[string]any) (string, error) {
	resp1, err := s.client.Request(httpclient.ApplyTempDESKey, httpclient.RequestOptions{})
	if err != nil {
		return "", err
	}
	resp2, err := s.client.Request(httpclient.ApplyTempNowTime, httpclient.RequestOptions{})
	if err != nil {
		return "", err
	}

	form := httpclient.ApplyCourseFn(resp1.String(), resp2.String(), s.termInfo, courseParams)
	resp3, err := s.client.Request(httpclient.ApplyCourse, httpclient.RequestOptions{Form: form})
	if err != nil {
		return "", err
	}
	return resp3.String(), nil
}
