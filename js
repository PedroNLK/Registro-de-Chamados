/ Classe para gerenciar os chamados
class SistemaChamados {
    constructor() {
        this.chamados = this.carregarChamados();
        this.inicializar();
    }

    inicializar() {
        this.configurarEventos();
        this.atualizarInterface();
    }

    configurarEventos() {
        // Evento de submissão do formulário
        const form = document.getElementById('chamadoForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarChamado();
        });

        // Evento de filtro por data
        const btnFiltrar = document.getElementById('btnFiltrar');
        btnFiltrar.addEventListener('click', () => {
            this.filtrarPorData();
        });

        // Evento de limpar filtro
        const btnLimparFiltro = document.getElementById('btnLimparFiltro');
        btnLimparFiltro.addEventListener('click', () => {
            document.getElementById('filtroData').value = '';
            this.atualizarInterface();
        });

        // Evento de exportar CSV
        const btnExportar = document.getElementById('btnExportar');
        btnExportar.addEventListener('click', () => {
            this.exportarCSV();
        });
    }

    adicionarChamado() {
        // Coletar dados do formulário
        const nome = document.getElementById('nome').value.trim();
        const centroCusto = document.getElementById('centroCusto').value.trim();
        const problema = document.getElementById('problema').value.trim();
        const telefone1 = document.getElementById('telefone1').value.trim();
        const telefone2 = document.getElementById('telefone2').value.trim();
        const status = document.getElementById('status').value;

        // Criar objeto do chamado
        const chamado = {
            id: Date.now(),
            nome,
            centroCusto,
            problema,
            telefone1,
            telefone2,
            status,
            data: new Date().toISOString(),
            dataFormatada: this.formatarData(new Date())
        };

        // Adicionar ao array
        this.chamados.push(chamado);

        // Salvar no localStorage
        this.salvarChamados();

        // Limpar formulário
        document.getElementById('chamadoForm').reset();

        // Atualizar interface
        this.atualizarInterface();

        // Mostrar mensagem de sucesso
        this.mostrarMensagem('Chamado registrado com sucesso!', 'success');
    }

    excluirChamado(id) {
        if (confirm('Tem certeza que deseja excluir este chamado?')) {
            this.chamados = this.chamados.filter(chamado => chamado.id !== id);
            this.salvarChamados();
            this.atualizarInterface();
            this.mostrarMensagem('Chamado excluído com sucesso!', 'success');
        }
    }

    filtrarPorData() {
        const dataFiltro = document.getElementById('filtroData').value;
        if (!dataFiltro) {
            alert('Por favor, selecione uma data para filtrar.');
            return;
        }

        const dataFiltroObj = new Date(dataFiltro + 'T00:00:00');
        const chamadosFiltrados = this.chamados.filter(chamado => {
            const dataChamado = new Date(chamado.data);
            return this.mesmaData(dataChamado, dataFiltroObj);
        });

        this.renderizarRegistros(chamadosFiltrados);
        this.atualizarEstatisticas(chamadosFiltrados);
    }

    mesmaData(data1, data2) {
        return data1.getFullYear() === data2.getFullYear() &&
               data1.getMonth() === data2.getMonth() &&
               data1.getDate() === data2.getDate();
    }

    atualizarInterface() {
        // Obter chamados de hoje
        const hoje = new Date();
        const chamadosHoje = this.chamados.filter(chamado => {
            const dataChamado = new Date(chamado.data);
            return this.mesmaData(dataChamado, hoje);
        });

        // Atualizar estatísticas com dados de hoje
        this.atualizarEstatisticas(chamadosHoje);

        // Renderizar todos os registros
        this.renderizarRegistros(this.chamados);
    }

    atualizarEstatisticas(chamados) {
        const resolvidos = chamados.filter(c => c.status === 'Resolvido').length;
        const direcionados = chamados.filter(c => c.status === 'Direcionado').length;
        const queda = chamados.filter(c => c.status === 'Queda de ligação').length;
        const total = chamados.length;

        document.getElementById('totalResolvidos').textContent = resolvidos;
        document.getElementById('totalDirecionados').textContent = direcionados;
        document.getElementById('totalQueda').textContent = queda;
        document.getElementById('totalGeral').textContent = total;
    }

    renderizarRegistros(chamados) {
        const listaRegistros = document.getElementById('listaRegistros');

        if (chamados.length === 0) {
            listaRegistros.innerHTML = '<p class="no-records">Nenhum chamado encontrado.</p>';
            return;
        }

        // Ordenar por data mais recente
        const chamadosOrdenados = [...chamados].sort((a, b) => 
            new Date(b.data) - new Date(a.data)
        );

        listaRegistros.innerHTML = chamadosOrdenados.map(chamado => `
            <div class="record-card ${chamado.status.toLowerCase()}">
                <div class="record-header">
                    <div>
                        <div class="record-nome">${this.escapeHtml(chamado.nome)}</div>
                        <div class="record-data">${chamado.dataFormatada}</div>
                    </div>
                    <span class="record-status ${chamado.status.toLowerCase()}">${chamado.status}</span>
                </div>
                <div class="record-body">
                    <div class="record-field">
                        <span class="record-label">Centro de Custo:</span>
                        <span class="record-value">${this.escapeHtml(chamado.centroCusto)}</span>
                    </div>
                    <div class="record-field">
                        <span class="record-label">Problema:</span>
                        <span class="record-value">${this.escapeHtml(chamado.problema)}</span>
                    </div>
                    <div class="record-field">
                        <span class="record-label">Telefone 1:</span>
                        <span class="record-value">${this.escapeHtml(chamado.telefone1 || chamado.telefone || '')}</span>
                    </div>
                    ${chamado.telefone2 ? `<div class="record-field">
                        <span class="record-label">Telefone 2:</span>
                        <span class="record-value">${this.escapeHtml(chamado.telefone2)}</span>
                    </div>` : ''}
                </div>
                <div class="record-actions">
                    <button class="btn-delete" onclick="sistema.excluirChamado(${chamado.id})">
                        Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatarData(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    salvarChamados() {
        localStorage.setItem('chamados', JSON.stringify(this.chamados));
    }

    carregarChamados() {
        const dados = localStorage.getItem('chamados');
        return dados ? JSON.parse(dados) : [];
    }

    exportarCSV() {
        if (this.chamados.length === 0) {
            alert('Não há chamados para exportar.');
            return;
        }

        // Cabeçalho do CSV
        let csv = 'Data,Nome,Centro de Custo,Problema,Telefone 1,Telefone 2,Status\n';

        // Adicionar dados
        this.chamados.forEach(chamado => {
            const linha = [
                chamado.dataFormatada,
                `"${chamado.nome}"`,
                `"${chamado.centroCusto}"`,
                `"${chamado.problema.replace(/"/g, '""')}"`,
                chamado.telefone1 || chamado.telefone || '',
                chamado.telefone2 || '',
                chamado.status
            ].join(',');
            csv += linha + '\n';
        });

        // Criar blob e download
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `chamados_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.mostrarMensagem('Arquivo CSV exportado com sucesso!', 'success');
    }

    mostrarMensagem(texto, tipo) {
        // Criar elemento de mensagem
        const mensagem = document.createElement('div');
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${tipo === 'success' ? '#38ef7d' : '#f5576c'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(mensagem);

        // Remover após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(mensagem);
            }, 300);
        }, 3000);
    }
}

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar o sistema quando a página carregar
let sistema;
document.addEventListener('DOMContentLoaded', () => {
    sistema = new SistemaChamados();
});
