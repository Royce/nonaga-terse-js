(set-env!
 :source-paths #{"src/cljs"}
 :resource-paths #{"html"}
 :dependencies '[
                 [org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.9.225"]
                 ;; [org.clojure/clojurescript "1.7.170"]
                 [adzerk/boot-cljs     "1.7.228-1" :scope "test"]
                 [pandeiro/boot-http      "0.7.3"  :scope "test"]
                 [adzerk/boot-cljs-repl   "0.3.3"  :scope "test"]
                 [org.clojure/tools.nrepl "0.2.12" :scope "test"]
                 [weasel                  "0.7.0"  :scope "test"]
                 [com.cemerick/piggieback "0.2.1"  :scope "test"]
                 ])

(require
 '[adzerk.boot-cljs :refer [cljs]]
 '[adzerk.boot-cljs-repl :refer [cljs-repl start-repl]]
 '[pandeiro.boot-http :refer [serve]])

;; boot dev
;; EMACS:
;; msc (connect-cider)
;; mss (repl buffer)
;; (start-repl)
(deftask dev []
  (comp (serve)
        (watch)
        (cljs-repl) ; order is important!!
        (cljs)))
