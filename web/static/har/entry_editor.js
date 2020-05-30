// Generated by CoffeeScript 1.12.7
(function() {
  define(function(require, exports, module) {
    var utils;
    require('/static/har/contenteditable');
    require('/static/har/editablelist');
    utils = require('/static/utils');
    return angular.module('entry_editor', ['contenteditable']).controller('EntryCtrl', function($scope, $rootScope, $sce, $http) {
      var changing;
      $scope.panel = 'request';
      $scope.copy_entry = null;
      $scope.$on('edit-entry', function(ev, entry) {
        var base, base1, base2;
        console.info(entry);
        $scope.entry = entry;
        if ((base = $scope.entry).success_asserts == null) {
          base.success_asserts = [
            {
              re: '' + $scope.entry.response.status,
              from: 'status'
            }
          ];
        }
        if ((base1 = $scope.entry).failed_asserts == null) {
          base1.failed_asserts = [];
        }
        if ((base2 = $scope.entry).extract_variables == null) {
          base2.extract_variables = [];
        }
        $scope.copy_entry = JSON.parse(utils.storage.get('copy_request'));
        angular.element('#edit-entry').modal('show');
        return $scope.alert_hide();
      });
      angular.element('#edit-entry').on('hidden.bs.modal', function(ev) {
        var ref;
        if ((ref = $scope.panel) === 'preview-headers' || ref === 'preview') {
          $scope.$apply(function() {
            var env, i, len, ref1, ret, rule;
            $scope.panel = 'test';
            env = utils.list2dict($scope.env);
            ref1 = $scope.entry.extract_variables;
            for (i = 0, len = ref1.length; i < len; i++) {
              rule = ref1[i];
              if (ret = $scope.preview_match(rule.re, rule.from)) {
                env[rule.name] = ret;
              }
            }
            return $scope.env = utils.dict2list(env);
          });
        }
        $scope.$apply(function() {
          return $scope.preview = void 0;
        });
        console.debug('har-change');
        return $rootScope.$broadcast('har-change');
      });
      $scope.alert = function(message) {
        return angular.element('.panel-test .alert').text(message).show();
      };
      $scope.alert_hide = function() {
        return angular.element('.panel-test .alert').hide();
      };
      changing = '';
      $scope.$watch('entry.request.url', function() {
        var error, queryString;
        if (changing && changing !== 'url') {
          changing = '';
          return;
        }
        if ($scope.entry == null) {
          return;
        }
        try {
          queryString = utils.dict2list(utils.querystring_parse_with_variables(utils.url_parse($scope.entry.request.url).query));
        } catch (error1) {
          error = error1;
          queryString = [];
        }
        if (!changing && !angular.equals(queryString, $scope.entry.request.queryString)) {
          $scope.entry.request.queryString = queryString;
          return changing = 'url';
        }
      });
      $scope.$watch('entry.request.queryString', (function() {
        var query, url;
        if (changing && changing !== 'qs') {
          changing = '';
          return;
        }
        if ($scope.entry == null) {
          return;
        }
        url = utils.url_parse($scope.entry.request.url);
        query = utils.list2dict($scope.entry.request.queryString);
        query = utils.querystring_unparse_with_variables(query);
        if (query) {
          url.search = "?" + query;
        }
        url = utils.url_unparse(url);
        if (!changing && url !== $scope.entry.request.url) {
          $scope.entry.request.url = url;
          return changing = 'qs';
        }
      }), true);
      $scope.$watch('entry.request.postData.params', (function() {
        var obj, ref, ref1;
        if (((ref = $scope.entry) != null ? (ref1 = ref.request) != null ? ref1.postData : void 0 : void 0) == null) {
          return;
        }
        obj = utils.list2dict($scope.entry.request.postData.params);
        return $scope.entry.request.postData.text = utils.querystring_unparse_with_variables(obj);
      }), true);
      $scope["delete"] = function(hashKey, array) {
        var each, i, index, len;
        for (index = i = 0, len = array.length; i < len; index = ++i) {
          each = array[index];
          if (each.$$hashKey === hashKey) {
            array.splice(index, 1);
            return;
          }
        }
      };
      $scope.variables_wrapper = function(string, place_holder) {
        var re;
        if (place_holder == null) {
          place_holder = '';
        }
        string = (string || place_holder).toString();
        re = /{{\s*([\w]+)[^}]*?\s*}}/g;
        return $sce.trustAsHtml(string.replace(re, '<span class="label label-primary">$&</span>'));
      };

      $scope.insert_request = function(pos, entry) {
        var current_pos;
        if (pos == null) {
          pos = 1;
        }
        if ((current_pos = $scope.$parent.har.log.entries.indexOf($scope.entry)) === -1) {
          $scope.alert("can't find position to add request");
          return;
        }
        current_pos += pos;
        $scope.$parent.har.log.entries.splice(current_pos, 0, entry);
        $rootScope.$broadcast('har-change');
        return angular.element('#edit-entry').modal('hide');
      };

      $scope.add_request = function(pos) {
        return $scope.insert_request(pos, {
          checked: false,
          pageref: $scope.entry.pageref,
          recommend: true,
          request: {
            method: 'GET',
            url: '',
            postData: {
              test: ''
            },
            headers: [],
            cookies: []
          },
          response: {}
        });
      };

      $scope.add_delay_request = function() {
        return $scope.insert_request(1, {
          checked: true,
          pageref: $scope.entry.pageref,
          recommend: true,
          comment: '延时3秒',
          request: {
            method: 'GET',
            url: location.origin + '/util/delay/3',
            postData: {
              test: ''
            },
            headers: [],
            cookies: []
          },
          response: {},
          success_asserts: [
            {
              re: "200",
              from: "status"
            }
          ]
        });
      };

      $scope.copy_request = function() {
        if (!$scope.entry) {
          $scope.alert("can't find position to paste request");
          return;
        }
        $scope.copy_entry = angular.copy($scope.entry);
        return utils.storage.set('copy_request', angular.toJson($scope.copy_entry));
      };
      $scope.paste_request = function(pos) {
        var base;
        if ((base = $scope.copy_entry).comment == null) {
          base.comment = '';
        }
		    $scope.copy_entry.comment = 'Copy_' + $scope.copy_entry.comment;
        $scope.copy_entry.pageref = $scope.entry.pageref;
        return $scope.insert_request(pos, $scope.copy_entry);
		
        /* $scope.copy_entry.comment = 'Copy_' + $scope.copy_entry.comment;
        $scope.copy_entry.pageref = $scope.entry.pageref;
        $scope.insert_request(pos, $scope.copy_entry);
		utils.storage.del('copy_request');
        return $scope.copy_entry = null; */
		// 老版本用于粘贴完释放粘贴板的功能
      };

      $scope.del_request = function(pos) {
        var current_pos;
        if (pos == null) {
          pos = 1;
        }
        if ((current_pos = $scope.$parent.har.log.entries.indexOf($scope.entry)) === -1) {
          $scope.alert("can't find position to add request");
          return;
        }
        current_pos += pos;
        $scope.$parent.har.log.entries.splice(current_pos, 1);
        $rootScope.$broadcast('har-change');
        return angular.element('#edit-entry').modal('hide');
      };


      return $scope.do_test = function() {
        var c, h, ref, ref1;
        angular.element('.do-test').button('loading');
        $http.post('/har/test', {
          request: {
            method: $scope.entry.request.method,
            url: $scope.entry.request.url,
            headers: (function() {
              var i, len, ref, results;
              ref = $scope.entry.request.headers;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                h = ref[i];
                if (h.checked) {
                  results.push({
                    name: h.name,
                    value: h.value
                  });
                }
              }
              return results;
            })(),
            cookies: (function() {
              var i, len, ref, results;
              ref = $scope.entry.request.cookies;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                c = ref[i];
                if (c.checked) {
                  results.push({
                    name: c.name,
                    value: c.value
                  });
                }
              }
              return results;
            })(),
            data: (ref = $scope.entry.request.postData) != null ? ref.text : void 0,
            mimeType: (ref1 = $scope.entry.request.postData) != null ? ref1.mimeType : void 0
          },
          rule: {
            success_asserts: $scope.entry.success_asserts,
            failed_asserts: $scope.entry.failed_asserts,
            extract_variables: $scope.entry.extract_variables
          },
          env: {
            variables: utils.list2dict($scope.env),
            session: $scope.session
          }
        }).success(function(data, status, headers, config) {
          var ref, ref1;
          angular.element('.do-test').button('reset');
          if (status !== 200) {
            $scope.alert(data);
            return;
          }
          $scope.preview = data.har;
          $scope.preview.success = data.success;
          $scope.env = utils.dict2list(data.env.variables);
          $scope.session = data.env.session;
          $scope.panel = 'preview';
          if (((ref = data.har.response) != null ? (ref1 = ref.content) != null ? ref1.text : void 0 : void 0) != null) {
            return setTimeout((function() {
              return angular.element('.panel-preview iframe').attr("src", "data:" + data.har.response.content.mimeType + ";base64," + data.har.response.content.text);
            }), 0);
          }
        }).error(function(data, status, headers, config) {
          angular.element('.do-test').button('reset');
          console.error('error', data, status, headers, config);
          return $scope.alert(data);
        });
        return $scope.preview_match = function(re, from) {
          var content, data, error, header, i, len, m, match, ref2, ref3, result;
          data = null;
          if (!from) {
            return null;
          } else if (from === 'content') {
            content = (ref2 = $scope.preview.response) != null ? ref2.content : void 0;
            if ((content == null) || (content.text == null)) {
              return null;
            }
            if (!content.decoded) {
              content.decoded = atob(content.text);
            }
            data = content.decoded;
          } else if (from === 'status') {
            data = '' + $scope.preview.response.status;
          } else if (from.indexOf('header-') === 0) {
            from = from.slice(7);
            ref3 = $scope.preview.response.headers;
            for (i = 0, len = ref3.length; i < len; i++) {
              header = ref3[i];
              if (header.name.toLowerCase() === from) {
                data = header.value;
              }
            }
          } else if (from === 'header') {
            data = ((function() {
              var j, len1, ref4, results;
              ref4 = $scope.preview.response.headers;
              results = [];
              for (j = 0, len1 = ref4.length; j < len1; j++) {
                h = ref4[j];
                results.push(h.name + ': ' + h.value);
              }
              return results;
            })()).join("\n");
          }
          if (!data) {
            return null;
          }
          try {
            if (match = re.match(/^\/(.*?)\/([gim]*)$/)) {
              re = new RegExp(match[1], match[2]);
            } else {
              re = new RegExp(re);
            }
          } catch (error1) {
            error = error1;
            console.error(error);
            return null;
          }
          if (re.global) {
            result = [];
            while (m = re.exec(data)) {
              result.push(m[1] ? m[1] : m[0]);
            }
            return result;
          } else {
            if (m = data.match(re)) {
              if (m[1]) {
                return m[1];
              } else {
                return m[0];
              }
            }
            return null;
          }
        };
      };
    });
  });

}).call(this);
