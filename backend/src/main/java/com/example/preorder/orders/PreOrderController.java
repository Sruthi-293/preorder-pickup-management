package com.example.preorder.orders;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class PreOrderController {
    private final PreOrderRepository repo;
    public PreOrderController(PreOrderRepository repo) { this.repo = repo; }

    @GetMapping public List<PreOrder> all() { return repo.findAll(); }
    @GetMapping("/{id}") public PreOrder one(@PathVariable Long id) { return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public PreOrder create(@Valid @RequestBody PreOrder order) { order.setId(null); return repo.save(order); }
    @PutMapping("/{id}") public PreOrder update(@PathVariable Long id, @Valid @RequestBody PreOrder order) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        order.setId(id); return repo.save(order);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repo.deleteById(id);
    }
}
