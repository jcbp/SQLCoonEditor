<?php

/**
 * Permite acceder a los argumentos pasados a la aplicación
 **/
class AppArgs {
	
	const GET = 'GET';
	const POST = 'POST';

	private $args;
	private $undefined = "";

	function __construct($method) {
		$this->args = $method == self::GET ? $_GET : $_POST;
	}

	public function setUndefinedVar($value) {
		$this->undefined = $value;
	}

	public function getVar($key) {
		return isset($this->args[$key]) ? $this->args[$key] : $this->undefined;
	}

	public function isVarExist($key, $isNotEmpty = false) {
		return $isNotEmpty ? ($this->getVar($key) && $this->getVar($key) != $this->undefined) : isset($this->args[$key]);
	}
}

?>
