package httpclient

import (
	"errors"
	"log"
	"mime"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strings"
	"time"
	"why-not-script/config"

	"github.com/go-resty/resty/v2"
	"golang.org/x/net/html/charset"
)

const defaultUserAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"

type Client struct {
	client *resty.Client
}

type RequestOptions struct {
	Form    url.Values
	Params  map[string]string
	Headers map[string]string
}

func NewClient() *Client {
	jar, _ := cookiejar.New(nil)
	restyClient := resty.New()
	restyClient.SetHeader("User-Agent", defaultUserAgent)
	restyClient.SetCookieJar(jar)
	restyClient.SetRetryCount(3)
	restyClient.SetRetryWaitTime(300 * time.Millisecond)
	restyClient.SetRetryMaxWaitTime(2 * time.Second)
	cfg := config.GetConfig()
	if cfg.Proxy {
		restyClient.SetProxy(cfg.ProxyAddress)
	}
	return &Client{client: restyClient}
}

func (c *Client) Request(it Interface, opts RequestOptions) (*resty.Response, error) {
	if c == nil || c.client == nil {
		return nil, errors.New("http client not initialized")
	}

	req := c.client.R()
	if it.Headers != nil {
		req.SetHeaders(it.Headers)
	}
	if opts.Headers != nil {
		req.SetHeaders(opts.Headers)
	}
	if len(opts.Params) > 0 {
		req.SetQueryParams(opts.Params)
	}
	if opts.Form != nil {
		req.SetHeader("Content-Type", "application/x-www-form-urlencoded")
		req.SetFormDataFromValues(opts.Form)
	}

	resp, err := req.Execute(it.Method, it.URL)
	if err != nil {
		log.Printf("[%s] request error: %v - %s", it.Method, err, it.Desc)
		return nil, err
	}
	if resp.StatusCode() >= http.StatusBadRequest {
		err = errors.New(resp.Status())
		log.Printf("[%s] http error: %v - %s", it.Method, err, it.Desc)
		return nil, err
	}

	if decoded, decErr := decodeResponseBody(resp.Body(), resp.Header().Get("Content-Type")); decErr == nil {
		resp.SetBody(decoded)
	}
	return resp, nil
}

func (c *Client) Cookies() http.CookieJar {
	if c == nil {
		return nil
	}
	return c.client.GetClient().Jar
}

func (c *Client) Resty() *resty.Client {
	if c == nil {
		return nil
	}
	return c.client
}

func decodeResponseBody(body []byte, contentType string) ([]byte, error) {
	if len(body) == 0 {
		return body, nil
	}
	if !shouldDecode(contentType) {
		return body, nil
	}
	enc, _, _ := charset.DetermineEncoding(body, contentType)
	if enc == nil {
		return body, nil
	}
	decoded, err := enc.NewDecoder().Bytes(body)
	if err != nil {
		return body, err
	}
	return decoded, nil
}

func shouldDecode(contentType string) bool {
	if contentType == "" {
		return true
	}
	mediaType, _, err := mime.ParseMediaType(contentType)
	if err != nil {
		return true
	}
	if strings.HasPrefix(mediaType, "text/") {
		return true
	}
	switch mediaType {
	case "application/json", "application/javascript", "application/xml", "application/xhtml+xml":
		return true
	default:
		return false
	}
}
