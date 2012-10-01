<?php

/**
 * Interfaz para diferentes tipos de respuestas Web: json, jsonp, xml, etc.
 */
interface IWebResponder {

	public function respond($str);
}

/**
 * No realiza ninguna respuesta
 **/
class VoidResponder implements IWebResponder {

	public function respond($str) { }
}

/**
 * Normaliza la respuesta HTTP acorde a una respuesta JSON
 **/
class JSONResponder implements IWebResponder {

	public function respond($str) {
		echo $str;
		exit();
	}
}

/**
 * Normaliza la respuesta HTTP acorde a una respuesta JSONP
 **/
class JSONPResponder implements IWebResponder {
	
	private $responseBegin = "jsonp(";
	private $responseEnd = ");";

	public $wrapperBegin = "[\"";
	public $wrapperEnd = "\"]";

	private function isJSONString($str) {
		preg_match('/^[{[].*[}\]]/', $str, $matches);
		return sizeof($matches) > 0;
	}
	
	private function format($str) {
		$responseBegin = $this->responseBegin;
		$responseEnd = $this->responseEnd;
		if (!$this->isJSONString($str)) {
			$responseBegin .= $this->wrapperBegin;
			$responseEnd = $this->wrapperEnd . $this->responseEnd;
		}
		return $responseBegin . $str . $responseEnd;
	}

	public function setFunctionName($name) {
		$this->responseBegin = $name . "(";
		$this->responseEnd = ");";
	}

	public function respond($str) {
		echo $this->format($str);
		exit();
	}
}

?>
