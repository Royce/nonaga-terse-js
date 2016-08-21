(set-env!
 :source-paths #{"src/cljs"}
 :resource-paths #{"html"}
 :dependencies '[
                 [org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.9.225"]
                 [adzerk/boot-cljs     "1.7.228-1" :scope "test"]
                 [pandeiro/boot-http      "0.7.3"  :scope "test"]
                 [adzerk/boot-reload      "0.4.12" :scope "test"]
                 [adzerk/boot-cljs-repl   "0.3.3"  :scope "test"]
                 [org.clojure/tools.nrepl "0.2.12" :scope "test"]
                 [weasel                  "0.7.0"  :scope "test"]
                 [com.cemerick/piggieback "0.2.1"  :scope "test"]
                 ])

;; (task-options!
 ;; repl {:middleware '[cemerick.piggieback/wrap-cljs-repl]})

(require
 '[adzerk.boot-cljs :refer [cljs]]
 '[adzerk.boot-cljs-repl :refer [cljs-repl-env start-repl]]
 '[pandeiro.boot-http :refer [serve]]
 '[adzerk.boot-reload :refer [reload]])

;;                       ;; boot dev
;; EMACS:
;; msi (cider jack in)   ;; msc (connect-cider)
;; mss (repl buffer)
;; (def p (future (boot (dev))))
;; (start-repl)
(deftask dev []
  (comp (serve :dir "target")
        (watch)
        (reload)
        ;; (cljs-repl) ; order is important!!
        (cljs-repl-env)
        (cljs)
        (target  :dir #{"target"})))
